export type BookingType = 'SIGHTSEEING' | 'WORKSHOP';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface ActionResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    bookings?: T; // For legacy support in some actions
}

export interface BookingSlot {
    id: string;
    date: Date | string;
    capacity: number;
    remainingCapacity: number;
}

export interface GlobalBlock {
    id: string;
    type: 'DATE' | 'MONTH';
    value: string;
    reason?: string | null;
}

export interface Booking {
    id: string;
    date: Date | string;
    email: string;
    name: string;
    people: number;
    type: BookingType;
    status: BookingStatus;
    adminNotes?: string | null;
    isGroup: boolean;
    institutionName?: string | null;
    institutionAddress?: string | null;
    slotId?: string | null;
    userId?: string | null;
    createdAt: Date | string;
}
