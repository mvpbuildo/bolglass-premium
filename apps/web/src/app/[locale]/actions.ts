'use server';

import { prisma } from '@bolglass/database';
import { revalidatePath } from 'next/cache';

export async function getAvailableSlots() {
    try {
        const globalBlocks = await prisma.globalBlock.findMany();

        const slots = await prisma.slot.findMany({
            where: {
                date: { gte: new Date() },
                isBlocked: false,
            },
            include: {
                bookings: { select: { people: true } }
            },
            orderBy: { date: 'asc' },
        });

        return slots.map(slot => {
            const bookedCount = slot.bookings.reduce((sum, b) => sum + b.people, 0);
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
                remainingCapacity: slot.capacity - bookedCount
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
                bookings: { select: { people: true } }
            },
            orderBy: { date: 'asc' },
        });

        return slots.map(slot => {
            const bookedCount = slot.bookings.reduce((sum: number, b: any) => sum + b.people, 0);
            const { bookings: _bookings, ...slotData } = slot;
            return {
                ...slotData,
                remainingCapacity: slot.capacity - bookedCount
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
}, isAdminOverride = false) {
    console.log('--- START createBooking ---', formData);
    try {
        const slot = await prisma.slot.findUnique({
            where: { id: formData.slotId },
            include: {
                bookings: {
                    select: { people: true }
                }
            },
        });

        if (!slot) throw new Error('Slot not found');

        const currentPeople = slot.bookings.reduce((sum: number, b: any) => sum + b.people, 0);

        // Admin can override capacity
        if (!isAdminOverride && (currentPeople + formData.people > slot.capacity)) {
            throw new Error(`Brak wolnych miejsc. Pozostało: ${slot.capacity - currentPeople}`);
        }

        const bookingPrice = slot.price || 150; // Use slot price or default

        const booking = await prisma.booking.create({
            data: {
                name: formData.name,
                email: formData.email,
                people: formData.people,
                date: slot.date,
                slotId: slot.id,
                status: 'CONFIRMED',
                priceBase: bookingPrice
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
