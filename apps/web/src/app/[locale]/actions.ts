'use server';

import { prisma } from '@bolglass/database';
import { revalidatePath } from 'next/cache';

// --- System Settings API ---

export async function getSystemSettings() {
    try {
        const settings = await prisma.systemSetting.findMany();
        const settingsMap: Record<string, string> = {};
        settings.forEach(s => settingsMap[s.key] = s.value);
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
    try {
        const globalBlocks = await prisma.globalBlock.findMany();

        // Fetch slots and bookings including TYPE
        const slots = await prisma.slot.findMany({
            where: {
                date: { gte: new Date() },
                isBlocked: false,
            },
            include: {
                bookings: { select: { people: true, type: true } }
            },
            orderBy: { date: 'asc' },
        });

        // 1. Build a map of "consumed capacity" per slot time
        // Key: timestamp (number), Value: current occupancy count
        const occupancyMap = new Map<number, number>();

        // Initialize map with base bookings for each slot
        slots.forEach(slot => {
            const time = slot.date.getTime();
            let count = 0;
            if (!occupancyMap.has(time)) occupancyMap.set(time, 0);

            slot.bookings.forEach(b => {
                count += b.people;
                // Approach B: WORKSHOP lasts ~80 mins -> Blocks current AND next slot (assuming 1h slots)
                // If this is a WORKSHOP, it adds "shadow occupancy" to the next hour
                if (b.type === 'WORKSHOP') {
                    const nextHourTime = time + (60 * 60 * 1000); // +1 hour
                    const currentShadow = occupancyMap.get(nextHourTime) || 0;
                    occupancyMap.set(nextHourTime, currentShadow + b.people);
                }
            });

            const currentTotal = occupancyMap.get(time) || 0;
            occupancyMap.set(time, currentTotal + count);
        });

        return slots.map(slot => {
            const time = slot.date.getTime();

            // Get total occupancy (direct bookings + shadow from previous workshops)
            // Note: The loop above might double count direct bookings if referenced incorrectly, 
            // but here we just need to read the final calculated map.
            // Wait, the logic above:
            // For slot T:
            //   Direct Bookings at T = X
            //   Shadow from T-1 (Workshops) = Y
            //   Total Occupancy = X + Y

            // Let's re-calculate correctly to be safe:
            // We need to look at:
            // 1. Bookings IN THIS slot (Direct)
            // 2. Bookings IN PREVIOUS slot that are WORKSHOPS (Shadow)

            const slotTime = slot.date.getTime();
            const prevSlotTime = slotTime - (60 * 60 * 1000);

            // Find bookings in this slot
            const directBookings = slot.bookings.reduce((sum, b) => sum + b.people, 0);

            // Find bookings in previous slot (we need to search the slots array again or use a map)
            // Using a map for quick lookup is better
            // Ideally we need strictly previous slot.
            // Let's implement a clean lookup.

            // Re-implementation of logic inside map for clarity:
            const prevSlot = slots.find(s => s.date.getTime() === prevSlotTime);
            let shadowOccupancy = 0;

            if (prevSlot) {
                // Sum people from previous slot who serve 'WORKSHOP'
                shadowOccupancy = prevSlot.bookings
                    .filter(b => b.type === 'WORKSHOP')
                    .reduce((sum, b) => sum + b.people, 0);
            }

            const totalOccupied = directBookings + shadowOccupancy;

            const { bookings, ...slotData } = slot;

            // Fix timezone issue: use YYYY-MM-DD from local-like perspective
            const d = new Date(slot.date);
            const dateStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
            const monthStr = dateStr.substring(0, 7);

            const isGloballyBlocked = globalBlocks.some(block =>
                (block.type === 'DATE' && block.value === dateStr) ||
                (block.type === 'MONTH' && block.value === monthStr)
            );

            if (isGloballyBlocked) return null;

            return {
                ...slotData,
                remainingCapacity: Math.max(0, slot.capacity - totalOccupied)
            };
        }).filter(slot => slot !== null && slot.remainingCapacity > 0);
    } catch (error) {
        console.error('Error fetching slots:', error);
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

            const directBookings = slot.bookings.reduce((sum, b) => sum + b.people, 0);

            // Shadow logic for Admin too
            const prevSlot = slots.find(s => s.date.getTime() === prevSlotTime);
            let shadowOccupancy = 0;
            if (prevSlot) {
                shadowOccupancy = prevSlot.bookings
                    .filter(b => b.type === 'WORKSHOP')
                    .reduce((sum, b) => sum + b.people, 0);
            }

            const { bookings: _bookings, ...slotData } = slot;
            return {
                ...slotData,
                remainingCapacity: Math.max(0, slot.capacity - (directBookings + shadowOccupancy))
            };
        });
    } catch (error) {
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
    console.log('--- START createBooking ---', formData);
    try {
        const slot = await prisma.slot.findUnique({
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
        const prevSlot = await prisma.slot.findFirst({
            where: { date: new Date(prevSlotTime) },
            include: { bookings: { select: { people: true, type: true } } }
        });

        const directUsage = slot.bookings.reduce((sum, b) => sum + b.people, 0);
        let shadowUsage = 0;
        if (prevSlot) {
            shadowUsage = prevSlot.bookings
                .filter(b => b.type === 'WORKSHOP')
                .reduce((sum, b) => sum + b.people, 0);
        }

        const totalUsage = directUsage + shadowUsage;

        // Admin can override capacity
        if (!isAdminOverride && (totalUsage + formData.people > slot.capacity)) {
            throw new Error(`Brak wolnych miejsc. Pozostało: ${slot.capacity - totalUsage}`);
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
                date: 'desc'
            }
        });
        return bookings;
    } catch (error) {
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
    } catch (error) {
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
        const capacity = 30;
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
