'use server';

import { prisma } from '@bolglass/database';
import { revalidatePath } from 'next/cache';

export async function getAvailableSlots() {
    try {
        const slots = await prisma.slot.findMany({
            where: {
                date: {
                    gte: new Date(), // Only future slots
                },
            },
            include: {
                _count: {
                    select: { bookings: true },
                },
            },
            orderBy: {
                date: 'asc',
            },
        });

        // Filter slots with available capacity
        return slots.filter(slot => slot.capacity > slot._count.bookings);
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
}) {
    try {
        // 1. Check if slot exists and has capacity
        const slot = await prisma.slot.findUnique({
            where: { id: formData.slotId },
            include: {
                _count: {
                    select: { bookings: true },
                },
            },
        });

        if (!slot) throw new Error('Slot not found');
        if (slot.capacity <= slot._count.bookings) {
            throw new Error('Slot is full');
        }

        // 2. Create booking
        const booking = await prisma.booking.create({
            data: {
                name: formData.name,
                email: formData.email,
                people: formData.people,
                date: slot.date,
                slotId: slot.id,
                status: 'CONFIRMED', // Based on user request
            },
        });

        revalidatePath('/[locale]', 'layout');
        return { success: true, booking };
    } catch (error: any) {
        console.error('Error creating booking:', error);
        return { success: false, error: error.message };
    }
}
