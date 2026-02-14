'use server';

import { prisma } from '@bolglass/database';
import { revalidatePath } from 'next/cache';
import { sendBookingConfirmation } from '@/lib/mail';
import { EMAIL_SETTING_KEYS } from '@/lib/mail-constants';

// --- System Settings API ---

export async function getAdminEmailSettings() {
    try {
        const keys = Object.values(EMAIL_SETTING_KEYS);
        const settings = await prisma.systemSetting.findMany({
            where: { key: { in: keys } }
        });
        const settingsMap: Record<string, string> = {};
        // Initialize defaults
        keys.forEach(k => settingsMap[k] = '');
        settings.forEach((s: any) => settingsMap[s.key] = s.value);
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
                bookings: { select: { people: true, type: true } }
            },
            orderBy: { date: 'asc' },
        });

        return slots.map(slot => {
            const slotTime = slot.date.getTime();
            const prevSlotTime = slotTime - (60 * 60 * 1000);

            const directBookings = slot.bookings.reduce((sum: number, b: any) => sum + b.people, 0);

            // Shadow logic for Admin too
            const prevSlot = slots.find(s => s.date.getTime() === prevSlotTime);
            let shadowOccupancy = 0;
            if (prevSlot) {
                shadowOccupancy = prevSlot.bookings
                    .filter((b: any) => b.type === 'WORKSHOP')
                    .reduce((sum: number, b: any) => sum + b.people, 0);
            }

            const { bookings: _bookings, ...slotData } = slot;
            return {
                ...slotData,
                remainingCapacity: Math.max(0, slot.capacity - (directBookings + shadowOccupancy))
            };
        });
    } catch (error: unknown) {
        console.error('Error fetching admin slots:', error);
        return [];
    }
}

export async function createBooking(formData: {
    slotId: string;
    name: string;
    email: string;
    people: number;
    type: string; // 'SIGHTSEEING' | 'WORKSHOP'
}, isAdminOverride = false) {
    console.log('--- SERVER ACTION: createBooking ---', { formData, isAdminOverride });
    console.log('--- START createBooking ---', formData);
    try {
        const slot = await (prisma as any).slot.findUnique({
            where: { id: formData.slotId },
            include: {
                bookings: { select: { people: true, type: true } }
            },
        });

        if (!slot) throw new Error('Slot not found');

        // 1. Calculate Current Occupancy (Direct + Shadow)
        const slotTime = slot.date.getTime();
        const prevSlotTime = slotTime - (60 * 60 * 1000);

        // We need to fetch previous slot to check for shadows occupancy
        // Optimization: Find prev slot from DB
        const prevSlot = await (prisma as any).slot.findFirst({
            where: { date: new Date(prevSlotTime) },
            include: { bookings: { select: { people: true, type: true } } }
        });

        const directUsage = slot.bookings.reduce((sum: number, b: any) => sum + b.people, 0);
        let shadowUsage = 0;
        if (prevSlot) {
            shadowUsage = prevSlot.bookings
                .filter((b: any) => b.type === 'WORKSHOP')
                .reduce((sum: number, b: any) => sum + b.people, 0);
        }

        const totalUsage = directUsage + shadowUsage;

        // Validation for the current slot
        if (!isAdminOverride && (totalUsage + formData.people > slot.capacity)) {
            console.log('Capacity exceeded for current slot:', { totalUsage, requested: formData.people, capacity: slot.capacity });
            throw new Error(`Brak wolnych miejsc w wybranej godzinie. Pozostało: ${slot.capacity - totalUsage}`);
        }

        // Additional validation for Workshops (Approach B: Blocks next slot too)
        if (formData.type === 'WORKSHOP' && !isAdminOverride) {
            const nextTime = slotTime + (60 * 60 * 1000);
            const nextSlot = await (prisma as any).slot.findFirst({
                where: { date: new Date(nextTime) },
                include: { bookings: { select: { people: true, type: true } } }
            });

            if (nextSlot) {
                const nDirect = nextSlot.bookings.reduce((sum: number, b: any) => sum + b.people, 0);
                const nShadow = slot.bookings
                    .filter((b: any) => b.type === 'WORKSHOP')
                    .reduce((sum: number, b: any) => sum + b.people, 0);

                const nTotal = nDirect + nShadow;
                if (nTotal + formData.people > nextSlot.capacity) {
                    throw new Error(`Brak wolnych miejsc w kolejnej godzinie (warsztaty wymagają dłuższego czasu). Pozostało: ${nextSlot.capacity - nTotal}`);
                }
            } else {
                console.warn('Workshop requested but next slot does not exist. Allowing booking based on current slot only.');
            }
        }

        // 2. Fetch Pricing from Settings
        const key = formData.type === 'WORKSHOP' ? 'price_workshop' : 'price_sightseeing';
        const setting = await prisma.systemSetting.findUnique({ where: { key } });

        // Fallbacks
        let finalPrice = 150;
        if (formData.type === 'WORKSHOP') finalPrice = 60;
        else if (formData.type === 'SIGHTSEEING') finalPrice = 35;

        // Apply setting if exists
        if (setting) {
            finalPrice = parseInt(setting.value);
        }

        // Slot specific price override (highest priority if set? Or maybe keep it simpler)
        // Let's say: System Setting is base. Slot.price overrides everything?
        // User asked for "Admin sets price 35/60". 
        // Logic: If slot has specific price, use it. Else use Global Setting based on Type.
        if (slot.price) {
            finalPrice = slot.price;
        }

        const booking = await prisma.booking.create({
            data: {
                name: formData.name,
                email: formData.email,
                people: formData.people,
                date: slot.date,
                slotId: slot.id,
                type: formData.type,
                status: 'CONFIRMED',
                priceBase: finalPrice
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

        console.log(`[EMAIL SIMULATION] Sending reminder to ${booking.email} for booking on ${booking.date}`);

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

export async function generateMonthSlots(year: number, month: number) {
    try {
        const startHour = 8;
        const endHour = 17;
        const capacity = 100;
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);

            // Skip past days? Maybe not needed for admin generation, but good practice.
            // if (date < new Date()) continue; 

            for (let hour = startHour; hour <= endHour; hour++) {
                const slotDate = new Date(date);
                slotDate.setHours(hour, 0, 0, 0);

                await prisma.slot.upsert({
                    where: { date: slotDate },
                    update: { capacity }, // Ensure capacity is set/updated
                    create: {
                        date: slotDate,
                        capacity,
                    },
                });
            }
        }
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error: any) {
        console.error('Error generating slots:', error);
        return { success: false, error: error.message };
    }
}
