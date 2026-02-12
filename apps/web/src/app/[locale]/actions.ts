'use server';

import { prisma } from '@bolglass/database';
import { revalidatePath } from 'next/cache';

export async function getAvailableSlots() {
    try {
        // 1. Get Global Blocks
        const globalBlocks = await prisma.globalBlock.findMany();

        const slots = await prisma.slot.findMany({
            where: {
                date: {
                    gte: new Date(),
                },
                isBlocked: false, // Don't show blocked slots
            },
            include: {
                bookings: {
                    select: { people: true }
                }
            },
            orderBy: {
                date: 'asc',
            },
        });

        // 2. Filter by Global Blocks
        return slots.map(slot => {
            const bookedCount = slot.bookings.reduce((sum, b) => sum + b.people, 0);
            const { bookings, ...slotData } = slot;

            // Check if date or month is blocked
            const dateStr = slot.date.toISOString().split('T')[0];
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

        const currentPeople = slot.bookings.reduce((sum, b) => sum + b.people, 0);

        // Admin can override capacity
        if (!isAdminOverride && (currentPeople + formData.people > slot.capacity)) {
            throw new Error(`Brak wolnych miejsc. Pozostało: ${slot.capacity - currentPeople}`);
        }

        const booking = await prisma.booking.create({
            data: {
                name: formData.name,
                email: formData.email,
                people: formData.people,
                date: slot.date,
                slotId: slot.id,
                status: 'CONFIRMED',
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
