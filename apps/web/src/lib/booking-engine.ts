import { prisma } from "@bolglass/database";

const WORKSHOP_ROOM_CAPACITY = 92;
const OPENING_HOUR = 8;
const CLOSING_HOUR = 16;
const SLOT_INTERVAL_MINUTES = 15;

export type BookingType = 'SIGHTSEEING' | 'WORKSHOP';

export const DURATION_MINUTES: Record<BookingType, number> = {
    'SIGHTSEEING': 30,
    'WORKSHOP': 80
};

/**
 * Checks availability for a specific date and group size.
 * Returns a list of valid start times (ISODates).
 */
export async function getAvailableStartTimes(dateStr: string, type: BookingType, peopleCount: number): Promise<string[]> {
    const requestedDuration = DURATION_MINUTES[type];

    // 1. Fetch all bookings for this day
    // We fetch a bit wider range to catch workshops starting before 8:00 but ending after
    const startOfDay = new Date(`${dateStr}T00:00:00`);
    const endOfDay = new Date(`${dateStr}T23:59:59`);

    const existingBookings = await prisma.booking.findMany({
        where: {
            date: {
                gte: startOfDay,
                lte: endOfDay
            },
            status: {
                not: 'CANCELLED'
            }
        },
        select: {
            date: true,
            type: true,
            people: true
        }
    });

    // 2. Also fetch global blocks for this day
    const globalBlocks = await prisma.globalBlock.findMany({
        where: {
            type: 'DATE',
            value: dateStr
        }
    });

    if (globalBlocks.length > 0) {
        return []; // Entire day is blocked
    }

    // 3. Generate all potential start slots (8:00 to 16:00 - duration)
    // convert opening hours to minutes from midnight
    const openMin = OPENING_HOUR * 60;
    const closeMin = CLOSING_HOUR * 60;
    // The last possible start time is when functionality ends exactly at closing
    // e.g. if close is 16:00 (960 min) and duration is 80, last start is 14:40 (880 min)
    const latestStartMin = closeMin - requestedDuration;

    const validStartTimes: string[] = [];

    // Loop through every 15 mins
    for (let time = openMin; time <= latestStartMin; time += SLOT_INTERVAL_MINUTES) {
        const potentialStart = new Date(startOfDay);
        potentialStart.setMinutes(time);

        const potentialEnd = new Date(potentialStart.getTime() + requestedDuration * 60000);

        // Check 1: Capacity Constraint (The "Tetris" check)
        // We must ensure that at ANY point during our proposed duration, the room capacity isn't exceeded.
        // Simplified: Check capacity at start, and every 15 min interval of our duration.
        // Actually, we should check against all existing bookings to see if their time intervals overlap with ours.

        // Let's verify resource usage for this specific proposed interval [potentialStart, potentialEnd]
        const isOverbooked = checkResourceOverlap(potentialStart, potentialEnd, peopleCount, existingBookings);

        if (!isOverbooked) {
            validStartTimes.push(potentialStart.toISOString());
        }
    }

    return validStartTimes;
}

/**
 * Returns true if adding `newPeople` to the room in `[start, end]` interval exceeds capacity.
 */
function checkResourceOverlap(newStart: Date, newEnd: Date, newPeople: number, existingBookings: any[]): boolean {
    // To be perfectly safe, we discretize the timeline or check max overlap.
    // A robust way: Collect all critical time points (starts and ends of all relevant events),
    // sort them, and sweep across to find max usage.

    // Filter relevant bookings that overlap with our window at all
    const relevantBookings = existingBookings.filter(b => {
        const bStart = new Date(b.date);
        const bDuration = DURATION_MINUTES[b.type as BookingType] || 30; // Default safety
        const bEnd = new Date(bStart.getTime() + bDuration * 60000);

        // Overlap logic: StartA < EndB && StartB < EndA
        return newStart < bEnd && bStart < newEnd;
    });

    // If no overlaps, strictly check against capacity (just us)
    if (newPeople > WORKSHOP_ROOM_CAPACITY) return true;
    if (relevantBookings.length === 0) return false;

    // Sweep Line Algorithm to find Peak Usage within our window
    // We only care about the time range [newStart, newEnd]
    // Events: +people at start, -people at end
    const events: { time: number, change: number }[] = [];

    // Add existing bookings to events
    relevantBookings.forEach(b => {
        const bStart = new Date(b.date).getTime();
        const bDuration = DURATION_MINUTES[b.type as BookingType] || 30;
        const bEnd = bStart + bDuration * 60000;

        // Clip events to our window? Not strictly necessary if we just check peak,
        // but we only care about peak *during* our window.
        // Actually, simpler: Just add all overlapping bookings' full timeline,
        // and add OUR proposed booking. Then scan.
        // If max usage exceeds capacity at any point where OUR booking is active, it's a fail.

        events.push({ time: bStart, change: b.people });
        events.push({ time: bEnd, change: -b.people });
    });

    // Add OUR proposed booking
    events.push({ time: newStart.getTime(), change: newPeople });
    events.push({ time: newEnd.getTime(), change: -newPeople });

    // Sort events
    // If times are equal, process ENDs (-change) before STARTs (+change) to be friendly?
    // Or strictly: if one ends at 9:00 and other starts 9:00, usually that's fine.
    events.sort((a, b) => {
        if (a.time !== b.time) return a.time - b.time;
        return a.change - b.change; // negatives (ends) first
    });

    let currentUsage = 0;

    // We need to check if usage > Capacity *during the intersection with our interval*.
    // But since we added our booking to the timeline, we just need to check if usageEVER > Capacity.
    // Wait, we added our booking. If usage > cap, it means we broke it.
    // Correct.

    for (const event of events) {
        currentUsage += event.change;
        if (currentUsage > WORKSHOP_ROOM_CAPACITY) {
            return true;
        }
    }

    return false;
}

/**
 * Validates if a specific booking request is allowed.
 * Used by Server Actions before creating a booking.
 */
export async function isBookingValid(date: Date, type: BookingType, peopleCount: number): Promise<{ valid: boolean; error?: string }> {
    const requestedDuration = DURATION_MINUTES[type];
    const newEnd = new Date(date.getTime() + requestedDuration * 60000);

    // 1. Check Global Blocks
    const dateStr = date.toISOString().split('T')[0];
    const globalBlocks = await prisma.globalBlock.findMany({
        where: {
            type: 'DATE',
            value: dateStr
        }
    });

    if (globalBlocks.length > 0) {
        return { valid: false, error: 'Dzień jest zablokowany przez administratora.' };
    }

    // 2. Fetch existing bookings
    // Start of Day / End of Day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await prisma.booking.findMany({
        where: {
            date: {
                gte: startOfDay,
                lte: endOfDay
            },
            status: {
                not: 'CANCELLED'
            }
        },
        select: {
            date: true,
            type: true,
            people: true
        }
    });

    const isOverbooked = checkResourceOverlap(date, newEnd, peopleCount, existingBookings);

    if (isOverbooked) {
        return { valid: false, error: 'Brak wystarczającej liczby miejsc w sali (przekroczony limit 92 osób w danym czasie).' };
    }

    return { valid: true };
}
