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
                bookings: {
                    select: { people: true }
                }
            },
            orderBy: {
                date: 'asc',
            },
        });

        // Filter slots with available capacity by summing people
        return slots.map(slot => {
            const bookedCount = slot.bookings.reduce((sum, b) => sum + b.people, 0);
            const { bookings, ...slotData } = slot;
            return {
                ...slotData,
                remainingCapacity: slot.capacity - bookedCount
            };
        }).filter(slot => slot.remainingCapacity > 0);
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
    console.log('--- START createBooking ---', formData);
    try {
        // 1. Check if slot exists and has capacity
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
        console.log('Slot found:', slot.id, 'Current people:', currentPeople, 'Requested:', formData.people, 'Max capacity:', slot.capacity);

        if (currentPeople + formData.people > slot.capacity) {
            throw new Error(`Brak wolnych miejsc. Pozostało: ${slot.capacity - currentPeople}`);
        }

        // 2. Create booking
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

        console.log('Booking created successfully:', booking.id);

        revalidatePath('/', 'layout');
        return { success: true, booking };
    } catch (error: any) {
        console.error('CRITICAL ERROR in createBooking:', error);
        return { success: false, error: error.message };
    }
}
