'use server';

import { prisma } from '@bolglass/database';
import { revalidatePath } from 'next/cache';
import { sendBookingConfirmation } from '@/lib/mail';
import { EMAIL_SETTING_KEYS } from '@/lib/mail-constants';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { auth } from '@/auth';

// --- System Settings API ---

export async function placeOrder(formData: FormData, cartItemsJson: string, total: number) {
    const session = await auth();
    const userId = session?.user?.id;

    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const zip = formData.get('zip') as string;
    const phone = formData.get('phone') as string;

    // Shipping & Payment Selections (Frontend must send these, or we default)
    const shippingMethodKey = formData.get('shippingMethod') as string || 'courier';
    const paymentMethodKey = formData.get('paymentMethod') as string || 'transfer';

    // VAT Invoice fields
    const documentType = formData.get('documentType') as string || 'RECEIPT';
    const nip = formData.get('nip') as string;
    const companyName = formData.get('companyName') as string;
    const companyAddress = formData.get('companyAddress') as string;

    const items = JSON.parse(cartItemsJson);

    if (!items || items.length === 0) {
        throw new Error("Cart is empty");
    }

    // --- Server-Side Validation ---
    const productIds = items.map((i: any) => i.id);
    const dbProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, price: true, name: true }
    });

    let calculatedItemsTotal = 0;
    const trustedItems: any[] = [];

    for (const item of items) {
        const dbProduct = dbProducts.find(p => p.id === item.id);

        if (!dbProduct) {
            throw new Error(`Product not found: ${item.name} (${item.id})`);
        }

        const itemTotal = dbProduct.price * item.quantity;
        calculatedItemsTotal += itemTotal;

        trustedItems.push({
            productId: dbProduct.id,
            name: dbProduct.name,
            price: dbProduct.price,
            quantity: item.quantity
        });
    }

    // --- Shipping Calculation (Universal Adapter) ---
    // We calculate rates based on trusted items and address
    // In a real scenario, we might call the provider to get the cost for the *selected* method specifically.
    // Here we get all rates and find the selected one.
    const rates = await shippingProvider.calculateRates(trustedItems, { city, zip });
    const selectedRate = rates.find(r => r.id === shippingMethodKey) || rates[0]; // Default to first if invalid
    const shippingCost = selectedRate ? selectedRate.price : 0;
    const shippingMethodName = selectedRate ? selectedRate.name : 'Unknown';

    const finalTotal = calculatedItemsTotal + shippingCost;

    const invoiceData = documentType === 'INVOICE' ? {
        nip,
        companyName,
        companyAddress
    } : null;

    // --- Create Order (Universal) ---
    const order = await prisma.order.create({
        data: {
            userId: userId || null,
            email: email,
            status: "PENDING",
            paymentStatus: "UNPAID",
            total: finalTotal,

            // Store provider info
            shippingMethod: shippingMethodName,
            shippingCost: shippingCost,
            // paymentProvider: paymentProvider.key, // Schema might need update for this field?
            // Checking schema: paymentProvider String? // "PAYU", "P24", "MANUAL"
            paymentProvider: paymentProvider.key,

            documentType,
            invoiceData: invoiceData as any,
            shippingAddress: {
                name,
                street: address,
                city,
                zip,
                phone
            },
            items: {
                create: trustedItems.map(item => ({
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                }))
            }
        }
    });

    // --- Payment Initialization (Universal Adapter) ---
    let paymentResult = { success: true, paymentUrl: `/sklep/zamowienie/${order.id}/potwierdzenie` };
    try {
        const result = await paymentProvider.createTransaction({
            id: order.id,
            total: finalTotal,
            currency: 'PLN',
            email: email,
            description: `Zamówienie #${order.id.substring(0, 8)}`
        });

        if (result.success && result.paymentUrl) {
            paymentResult.paymentUrl = result.paymentUrl;
        }
    } catch (error) {
        console.error("Payment initialization failed:", error);
        // Soft fail: Order created, but auto-redirect failed. User can retry from order page.
    }

    // Persistence: Update User Profile if logged in
    if (userId && documentType === 'INVOICE') {
        try {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    isCompany: true,
                    companyName: companyName,
                    nip: nip,
                    companyStreet: companyAddress,
                }
            });
        } catch (err) {
            console.error("Failed to update user profile with company data:", err);
        }
    }

    return {
        orderId: order.id,
        success: true,
        paymentUrl: paymentResult.paymentUrl
    };
}

export async function getAdminEmailSettings() {
    try {
        const keys = Object.values(EMAIL_SETTING_KEYS);
        const settings = await prisma.systemSetting.findMany({
            where: { key: { in: keys } }
        });
        const settingsMap: Record<string, string> = {};

        // Define defaults for all keys
        const defaults: Record<string, string> = {
            [EMAIL_SETTING_KEYS.EMAIL_SUBJECT_SIGHTSEEING]: 'Potwierdzenie rezerwacji zwiedzania - Bolglass',
            [EMAIL_SETTING_KEYS.EMAIL_BODY_SIGHTSEEING]: 'Dziękujemy za rezerwację zwiedzania w Bolglass!\nData: {{date}}\nLiczba osób: {{people}}\nSuma do zapłaty: {{total}} zł',
            [EMAIL_SETTING_KEYS.EMAIL_SUBJECT_WORKSHOP]: 'Potwierdzenie rezerwacji warsztatów - Bolglass',
            [EMAIL_SETTING_KEYS.EMAIL_BODY_WORKSHOP]: 'Dziękujemy za rezerwację warsztatów w Bolglass!\nData: {{date}}\nLiczba osób: {{people}}\nSuma do zapłaty: {{total}} zł',
            [EMAIL_SETTING_KEYS.EMAIL_SUBJECT_REMINDER]: 'Przypomnienie o wizycie w Bolglass',
            [EMAIL_SETTING_KEYS.EMAIL_BODY_REMINDER]: 'Dzień dobry!\nPrzypominamy o rezerwacji na jutro.\nData: {{date}}\nLiczba osób: {{people}}\nSuma do zapłaty: {{total}} zł',
            [EMAIL_SETTING_KEYS.EMAIL_SUBJECT_UPDATE]: 'Aktualizacja Twojej rezerwacji w Bolglass',
            [EMAIL_SETTING_KEYS.EMAIL_BODY_UPDATE]: 'Dzień dobry!\nTwoja rezerwacja została zaktualizowana.\nNowa liczba osób: {{people}}\nData: {{date}}'
        };

        // Initialize with defaults
        keys.forEach(k => settingsMap[k] = defaults[k] || '');

        settings.forEach((s: any) => {

            // If the database has a value, but it's an email body and it's too short, 
            // we ignore it and keep our professional default.
            const isBody = s.key.includes('body');
            const isTooShort = isBody && s.value.trim().length < 20;

            if (s.value && !isTooShort) {
                settingsMap[s.key] = s.value;
            }
        });
        return settingsMap;
    } catch (error) {
        console.error('Error fetching email settings:', error);
        return {};
    }
}

export async function updateAdminEmailSettings(settings: Record<string, string>) {
    try {
        await Promise.all(
            Object.entries(settings).map(([key, value]) =>
                prisma.systemSetting.upsert({
                    where: { key },
                    update: { value },
                    create: { key, value }
                })
            )
        );
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error: unknown) {
        console.error('Error updating email settings:', error);
        return { success: false, error: (error as Error).message };
    }
}

export async function getSystemSettings() {
    try {
        const settings = await prisma.systemSetting.findMany();
        const settingsMap: Record<string, string> = {};
        settings.forEach((s: { key: string; value: string }) => settingsMap[s.key] = s.value);
        return settingsMap;
    } catch (error) {
        console.error('Error fetching settings:', error);
        return {};
    }
}

export async function updateSystemSetting(key: string, value: string) {
    try {
        await prisma.systemSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating setting:', error);
        return { success: false, error: error.message };
    }
}

// --- Slot Logic ---

export async function getAvailableSlots() {
    console.log('--- SERVER ACTION: getAvailableSlots ---');
    try {
        const globalBlocks = await prisma.globalBlock.findMany();

        // 1. Fetch future slots
        const slots = await prisma.slot.findMany({
            where: {
                date: { gte: new Date() },
                isBlocked: false,
            },
            include: {
                bookings: { select: { people: true, type: true } }
            },
            orderBy: { date: 'asc' },
        }) as any[];

        if (slots.length === 0) {
            console.log('No future slots found in DB.');
            return [];
        }

        // 2. Build occupancy map (direct + shadow)
        const occupancyMap = new Map<number, number>();

        // Pass 1: Sum all direct and shadow usages
        slots.forEach(slot => {
            const time = slot.date.getTime();
            const direct = slot.bookings.reduce((sum: number, b: any) => sum + b.people, 0);

            const current = occupancyMap.get(time) || 0;
            occupancyMap.set(time, current + direct);

            // Approach B: Workshop blocks the next slot too
            const workshopUsage = slot.bookings
                .filter((b: any) => b.type === 'WORKSHOP')
                .reduce((sum: number, b: any) => sum + b.people, 0);

            if (workshopUsage > 0) {
                const nextTime = time + (60 * 60 * 1000);
                const nextOccupancy = occupancyMap.get(nextTime) || 0;
                occupancyMap.set(nextTime, nextOccupancy + workshopUsage);
            }
        });

        const result = slots.map(slot => {
            const time = slot.date.getTime();
            const totalOccupied = occupancyMap.get(time) || 0;
            const remaining = Math.max(0, slot.capacity - totalOccupied);

            const d = new Date(slot.date);
            const dateStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
            const monthStr = dateStr.substring(0, 7);

            const isGloballyBlocked = globalBlocks.some(block =>
                (block.type === 'DATE' && block.value === dateStr) ||
                (block.type === 'MONTH' && block.value === monthStr)
            );

            if (isGloballyBlocked) return null;

            return {
                id: slot.id,
                date: slot.date,
                capacity: slot.capacity,
                remainingCapacity: remaining
            };
        }).filter(s => s !== null && s.remainingCapacity > 0);

        console.log(`Available slots found: ${result.length} out of ${slots.length}`);
        return result;
    } catch (error) {
        console.error('Error in getAvailableSlots:', error);
        return [];
    }
}

export async function getAdminSlots() {
    try {
        const slots = await prisma.slot.findMany({
            include: {
                bookings: { select: { people: true, type: true, date: true } }
            },
            orderBy: { date: 'asc' },
        });

        // We need all bookings to check overlaps efficiently.
        // Since we are iterating slots, let's just fetch all confirmed bookings in the relevant range?
        // Or simpler: Iterate slots, and for each slot, filter the bookings from the *overall* list?
        // Optimisation: define a range for the slots usually fetched (current month?)
        // But getAdminSlots fetches *all* slots in DB currently. That might be heavy eventually.
        // For now, let's keep it simple.

        // Better: For each slot, we want "People currently in room".
        // A booking B (date, type, people) occupies room from [B.date] to [B.date + duration].
        // Occupancy at Slot S (time T) is sum(B.people) where B.start <= T < B.end.

        // Let's create a list of all active bookings expanded with start/end times.
        const allBookings = await prisma.booking.findMany({
            where: { status: { not: 'CANCELLED' } },
            select: { date: true, type: true, people: true }
        });

        const expandedBookings = allBookings.map(b => {
            const duration = b.type === 'WORKSHOP' ? 80 : 30; // Hardcoded constants from logic
            return {
                start: b.date.getTime(),
                end: b.date.getTime() + (duration * 60000),
                people: b.people
            };
        });

        return slots.map(slot => {
            const slotTime = slot.date.getTime();

            // Calculate total people currently in the room at this slot time
            const currentOccupancy = expandedBookings
                .filter(b => b.start <= slotTime && b.end > slotTime)
                .reduce((sum, b) => sum + b.people, 0);

            const { bookings: _bookings, ...slotData } = slot;
            return {
                ...slotData,
                // Capacity is 92 fixed for calculation, or slot.capacity if we want to honor overrides?
                // Let's rely on slot.capacity as the "Room Limit" (usually 92 or 100).
                // Remaining is Limit - Current Occupancy.
                remainingCapacity: Math.max(0, slot.capacity - currentOccupancy)
            };
        });
    } catch (error: unknown) {
        console.error('Error fetching admin slots:', error);
        return [];
    }
}

export async function getBookingsByDate(dateStr: string) {
    try {
        const startOfDay = new Date(`${dateStr}T00:00:00.000Z`); // Assuming strict UTC mapping or use local-aware range if safer
        // Actually, dates in DB are UTC.
        // If frontend sends '2023-10-25', we want that day in local time range?
        // Let's be safe: date from 00:00 to 23:59 of that calendar date string.
        const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

        // Adjust for timezone? 
        // If we want bookings for "2023-10-25" in Poland, that is 2023-10-24 22:00 UTC to 2023-10-25 22:00 UTC (winter)
        // OR roughly just grab a wider range and filter?
        // Let's rely on the fact that `dateStr` comes from the calendar which uses local dates.
        // Using `getWarsawStart` logic might be overkill for just listing.
        // Let's fetch broader range (UTC Day) which usually covers most day events, 
        // OR better: use `prisma` date filtering which is timezone agnostic if we construct Dates correctly.

        // Simple approach: Input is YYYY-MM-DD.
        // We want all bookings where booking.date string representation starts with YYYY-MM-DD? No, date is DateTime.

        const bookings = await prisma.booking.findMany({
            where: {
                date: {
                    gte: new Date(dateStr + 'T00:00:00'),
                    lte: new Date(dateStr + 'T23:59:59')
                },
                status: { not: 'CANCELLED' }
            },
            orderBy: { date: 'asc' },
            select: {
                id: true,
                date: true,
                type: true,
                people: true,
                name: true,
                email: true,
                isGroup: true,
                institutionName: true
            }
        });
        return { success: true, bookings };
    } catch (error: any) {
        console.error('Error in getBookingsByDate:', error);
        return { success: false, error: error.message };
    }
}

export async function createBooking(formData: {
    slotId?: string;
    date?: string | Date;
    name: string;
    email: string;
    people: number;
    type: string; // 'SIGHTSEEING' | 'WORKSHOP'
    isGroup?: boolean;
    institutionName?: string;
    institutionAddress?: string;
}, isAdminOverride = false) {
    console.log('--- SERVER ACTION: createBooking ---', { formData, isAdminOverride });
    try {
        let bookingDate: Date;
        let slotId = formData.slotId;

        // 1. Determine Date and Slot
        if (slotId) {
            const slot = await prisma.slot.findUnique({ where: { id: slotId } });
            if (!slot) throw new Error('Slot not found');
            bookingDate = slot.date;
        } else if (formData.date) {
            bookingDate = new Date(formData.date);
            // Try to find matching slot
            const slot = await prisma.slot.findUnique({ where: { date: bookingDate } });
            if (slot) {
                slotId = slot.id;
            } else {
                // If slot doesn't exist (e.g. generated yet?), we could create it or error.
                // For robustness, let's create it on the fly if legal time
                // Or just error. Let's error for now to enforce generation.
                // Actually, if we want robust 15-min support, we should probably ensure it exists.
                // But let's assume generateMonthSlots was run.
                throw new Error('Wybrany termin nie ma zdefiniowanego slotu w systemie. Skontaktuj się z administratorem.');
            }
        } else {
            throw new Error('Missing date or slotId');
        }

        // 2. Validate Resource Availability (The "Tetris" Check)
        if (!isAdminOverride) {
            // Import dynamically to avoid circular deps if any (though imports are top level)
            const { isBookingValid } = await import('@/lib/booking-engine');
            const validation = await isBookingValid(bookingDate, formData.type as BookingType, formData.people);

            if (!validation.valid) {
                throw new Error(validation.error || 'Termin niedostępny.');
            }
        }

        // 3. Fetch Pricing
        const key = formData.type === 'WORKSHOP' ? 'price_workshop' : 'price_sightseeing';
        const setting = await prisma.systemSetting.findUnique({ where: { key } });

        let finalPrice = 150;
        if (formData.type === 'WORKSHOP') finalPrice = 60;
        else if (formData.type === 'SIGHTSEEING') finalPrice = 35;

        if (setting) {
            finalPrice = parseInt(setting.value);
        }

        // Check if slot has override price
        if (slotId) {
            const slot = await prisma.slot.findUnique({ where: { id: slotId } });
            if (slot?.price) finalPrice = slot.price;
        }

        const booking = await prisma.booking.create({
            data: {
                name: formData.name,
                email: formData.email,
                people: formData.people,
                date: bookingDate,
                slotId: slotId, // Can be null? Schema says slot Slot? So yes. But we try to link.
                type: formData.type,
                status: 'CONFIRMED',
                priceBase: finalPrice,
                isGroup: formData.isGroup || false,
                institutionName: formData.institutionName,
                institutionAddress: formData.institutionAddress
            },
        });

        revalidatePath('/', 'layout');

        // Trigger email confirmation asynchronously
        sendBookingConfirmation(booking).catch(err => console.error('Immediate confirmation send failed:', err));

        return { success: true, booking };
    } catch (error: any) {
        console.error('CRITICAL ERROR in createBooking:', error);
        return { success: false, error: error.message };
    }
}

export async function getAllBookings() {
    try {
        const bookings = await prisma.booking.findMany({
            include: {
                slot: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return bookings;
    } catch (error: any) {
        console.error('Error fetching all bookings:', error);
        return [];
    }
}

export async function updateBookingAdmin(id: string, data: { status?: string, adminNotes?: string }) {
    try {
        const booking = await prisma.booking.update({
            where: { id },
            data: {
                status: data.status,
                adminNotes: data.adminNotes
            }
        });
        revalidatePath('/', 'layout');
        return { success: true, booking };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteBooking(id: string) {
    try {
        await prisma.booking.delete({
            where: { id }
        });
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting booking:', error);
        return { success: false, error: error.message };
    }
}

export async function updateBookingPeople(id: string, people: number) {
    try {
        const booking = await prisma.booking.update({
            where: { id },
            data: { people }
        });
        revalidatePath('/', 'layout');

        // Send email asynchronously
        const { sendBookingUpdateEmail } = await import('@/lib/mail');
        sendBookingUpdateEmail(booking).catch(err => console.error('Failed to send update email:', err));

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}



export async function updateSlotCapacity(id: string, capacity: number) {
    try {
        await prisma.slot.update({
            where: { id },
            data: { capacity }
        });
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function sendBookingReminder(id: string) {
    try {
        const booking = await prisma.booking.findUnique({ where: { id } });
        if (!booking) throw new Error('Booking not found');

        const { sendBookingReminderEmail } = await import('@/lib/mail');
        await sendBookingReminderEmail(booking);

        await prisma.booking.update({
            where: { id },
            data: { reminderSentAt: new Date() }
        });

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateSlotPrice(slotId: string, price: number | null) {
    try {
        await prisma.slot.update({
            where: { id: slotId },
            data: { price }
        });
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getAdminStats() {
    try {
        const bookings = await prisma.booking.findMany({
            select: {
                date: true,
                people: true
            }
        });

        const dayStats: Record<string, number> = { 'Pn': 0, 'Wt': 0, 'Śr': 0, 'Cz': 0, 'Pt': 0, 'So': 0, 'Nd': 0 };
        const hourStats: Record<string, number> = {};

        const dayNames = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'];

        bookings.forEach((b: any) => {
            const date = new Date(b.date);
            const dayName = dayNames[date.getDay()];
            const hour = date.getHours().toString().padStart(2, '0') + ':00';

            dayStats[dayName] += b.people;
            hourStats[hour] = (hourStats[hour] || 0) + b.people;
        });

        return { dayStats, hourStats };
    } catch (error: any) {
        console.error('Error fetching admin stats:', error);
        return { dayStats: {}, hourStats: {} };
    }
}

// Global Blocks API
export async function getGlobalBlocks() {
    return prisma.globalBlock.findMany({ orderBy: { value: 'asc' } });
}

export async function setGlobalBlock(type: 'DATE' | 'MONTH', value: string, reason?: string) {
    try {
        const block = await prisma.globalBlock.create({
            data: { type, value, reason }
        });
        revalidatePath('/', 'layout');
        return { success: true, block };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function removeGlobalBlock(id: string) {
    try {
        await prisma.globalBlock.delete({ where: { id } });
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- Booking Engine Integration ---

import { getAvailableStartTimes, BookingType } from '@/lib/booking-engine';

export async function getBookingAvailability(date: string, type: BookingType, people: number) {
    try {
        const slots = await getAvailableStartTimes(date, type, people);
        return { success: true, slots };
    } catch (error: any) {
        console.error('Error in getBookingAvailability:', error);
        return { success: false, error: error.message };
    }
}

// ... existing code ...

export async function generateMonthSlots(year: number, month: number) {
    try {
        const { getWarsawStart } = await import('@/lib/booking-engine');
        const startHour = 8;
        const endHour = 16;
        const capacity = 100; // Legacy generic capacity
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            // We construct the date string manually to avoid local timezone issues
            const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

            for (let hour = startHour; hour <= endHour; hour++) {
                for (let min = 0; min < 60; min += 15) {
                    // Don't generate slots after 16:00
                    if (hour === endHour && min > 0) continue;

                    // Use the helper to get the correct UTC timestamp for Warsaw Time
                    const slotDate = getWarsawStart(dateStr, hour, min);

                    await prisma.slot.upsert({
                        where: { date: slotDate },
                        update: { capacity },
                        create: {
                            date: slotDate,
                            capacity,
                        },
                    });
                }
            }
        }
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error: any) {
        console.error('Error generating slots:', error);
        return { success: false, error: error.message };
    }
}

export async function uploadContactLogo(formData: FormData) {
    console.log("uploadContactLogo action started");
    try {
        const file = formData.get('file') as File;

        if (!file || file.size === 0) {
            return { error: "Nie wybrano pliku." };
        }

        console.log(`Processing logo upload: ${file.name}, size: ${file.size}`);
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Robust path handling
        const isWebPackage = process.cwd().endsWith('web') || require('fs').existsSync(join(process.cwd(), 'public'));
        const uploadDir = isWebPackage
            ? join(process.cwd(), 'public', 'uploads')
            : join(process.cwd(), 'apps', 'web', 'public', 'uploads');

        await mkdir(uploadDir, { recursive: true });

        const ext = file.name.split('.').pop() || 'jpg';
        const finalFilename = `logo-${Date.now()}.${ext}`;
        const filepath = join(uploadDir, finalFilename);

        console.log(`Writing logo to: ${filepath}`);
        await writeFile(filepath, buffer);

        const fileUrl = `/uploads/${finalFilename}`;
        return { success: true, url: fileUrl };
    } catch (error: any) {
        console.error("Upload logo failed:", error);
        return { error: "Wystąpił błąd podczas przesyłania logo." };
    }
}
// --- Analytics ---

export async function trackVisit() {
    try {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
        const date = new Date(dateStr + "T00:00:00.000Z");

        await prisma.analyticsDay.upsert({
            where: { date },
            update: { views: { increment: 1 } },
            create: { date, views: 1 }
        });
        return { success: true };
    } catch (error) {
        console.error("Error tracking visit:", error);
        return { success: false };
    }
}
