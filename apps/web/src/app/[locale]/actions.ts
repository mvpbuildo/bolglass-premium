'use server';

import { prisma } from '@bolglass/database';
import { revalidatePath, revalidateTag } from 'next/cache';
import { EMAIL_SETTING_KEYS } from '@/lib/mail-constants';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { auth } from '@/auth';

// --- System Settings API ---

import { CheckoutService } from '@/services/CheckoutService';

export async function placeOrder(formData: FormData, cartItemsJson: string, total: number) {
    const session = await auth();
    const userId = session?.user?.id;
    const items = JSON.parse(cartItemsJson);

    return await CheckoutService.placeOrder({
        formData,
        cartItems: items,
        userId
    });
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

import { BookingService, BookingInput } from '@/services/BookingService';

export async function createBooking(formData: BookingInput, isAdminOverride = false) {
    return await BookingService.createBooking(formData, isAdminOverride);
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
    return await BookingService.deleteBooking(id);
}

export async function updateBookingPeople(id: string, people: number) {
    return await BookingService.updateBookingPeople(id, people);
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
    return await BookingService.sendReminder(id);
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
        const isWebPackage = process.cwd().endsWith('web') || existsSync(join(process.cwd(), 'public'));
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

export async function deleteCurrentUserAccount() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        await prisma.user.delete({
            where: { id: session.user.id }
        });

        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error: any) {
        console.error("Account deletion failed:", error);
        return { success: false, error: error.message };
    }
}
