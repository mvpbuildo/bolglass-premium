import { prisma } from '@bolglass/database';
import { revalidatePath } from 'next/cache';
import { sendBookingConfirmation, sendBookingUpdateEmail, sendBookingReminderEmail } from '@/lib/mail';
import { isBookingValid, BookingType } from '@/lib/booking-engine';

export interface BookingInput {
    slotId?: string;
    date?: string | Date;
    name: string;
    email: string;
    people: number;
    type: string;
    isGroup?: boolean;
    institutionName?: string;
    institutionAddress?: string;
}

export class BookingService {
    static async createBooking(data: BookingInput, isAdminOverride = false) {
        let bookingDate: Date;
        let slotId = data.slotId;

        // 1. Determine Date and Slot
        if (slotId) {
            const slot = await prisma.slot.findUnique({ where: { id: slotId } });
            if (!slot) throw new Error('Slot not found');
            bookingDate = slot.date;
        } else if (data.date) {
            bookingDate = new Date(data.date);
            const slot = await prisma.slot.findUnique({ where: { date: bookingDate } });
            if (slot) {
                slotId = slot.id;
            } else {
                throw new Error('Wybrany termin nie ma zdefiniowanego slotu w systemie.');
            }
        } else {
            throw new Error('Missing date or slotId');
        }

        // 2. Validate Availability
        if (!isAdminOverride) {
            const validation = await isBookingValid(bookingDate, data.type as BookingType, data.people);
            if (!validation.valid) {
                throw new Error(validation.error || 'Termin niedostępny.');
            }
        }

        // 3. Pricing
        const key = data.type === 'WORKSHOP' ? 'price_workshop' : 'price_sightseeing';
        const setting = await prisma.systemSetting.findUnique({ where: { key } });

        let finalPrice = data.type === 'WORKSHOP' ? 60 : 35;
        if (setting) finalPrice = parseInt(setting.value);

        if (slotId) {
            const slot = await prisma.slot.findUnique({ where: { id: slotId } });
            if (slot?.price) finalPrice = slot.price;
        }

        const booking = await prisma.booking.create({
            data: {
                name: data.name,
                email: data.email,
                people: data.people,
                date: bookingDate,
                slotId: slotId,
                type: data.type,
                status: 'CONFIRMED',
                priceBase: finalPrice,
                isGroup: data.isGroup || false,
                institutionName: data.institutionName,
                institutionAddress: data.institutionAddress
            },
        });

        revalidatePath('/', 'layout');
        sendBookingConfirmation(booking).catch(err => console.error('Confirmation send failed:', err));

        return { success: true, booking };
    }

    static async updateBookingPeople(id: string, people: number) {
        const booking = await prisma.booking.update({
            where: { id },
            data: { people }
        });
        revalidatePath('/', 'layout');
        sendBookingUpdateEmail(booking).catch(err => console.error('Update email failed:', err));
        return { success: true };
    }

    static async sendReminder(id: string) {
        const booking = await prisma.booking.findUnique({ where: { id } });
        if (!booking) throw new Error('Booking not found');

        await sendBookingReminderEmail(booking);
        await prisma.booking.update({
            where: { id },
            data: { reminderSentAt: new Date() }
        });
        return { success: true };
    }

    static async deleteBooking(id: string) {
        await prisma.booking.delete({ where: { id } });
        revalidatePath('/', 'layout');
        return { success: true };
    }
}
