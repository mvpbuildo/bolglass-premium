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
/**
 * Helper to construct a Date object that represents a specific time in Warsaw (Europe/Warsaw).
 * Useful because the server might be UTC, but we want "8:00" to mean "8:00 PL".
 */
export function getWarsawStart(dateStr: string, hour: number, minute: number): Date {
    // Parse the input date string locally to get components
    // We assume dateStr is YYYY-MM-DD
    const [y, m, d] = dateStr.split('-').map(Number);

    // We want to find a UTC timestamp X such that X in 'Europe/Warsaw' is y-m-d h:m
    // We start with a guess: UTC time = Request Time (i.e. assuming UTC+0)
    // Then we check the difference and adjust.
    // Warsaw is UTC+1 or UTC+2. 
    // So if we want 8:00 PL, we expect 7:00 or 6:00 UTC.
    // Our guess 8:00 UTC will be 9:00 or 10:00 PL.

    let candidate = new Date(Date.UTC(y, m - 1, d, hour, minute));

    // Check what time this candidate is in Warsaw
    const formatter = new Intl.DateTimeFormat('pl-PL', {
        timeZone: 'Europe/Warsaw',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
    });

    // Loop to adjust (max a few iterations)
    for (let i = 0; i < 3; i++) {
        const parts = formatter.formatToParts(candidate);
        const plHour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
        const plMin = parseInt(parts.find(p => p.type === 'minute')?.value || '0');

        // Calculate difference in minutes
        // We want (hour, minute). We have (plHour, plMin).
        // Diff = (plHour * 60 + plMin) - (hour * 60 + minute)
        // If we want 8:00 and got 9:00, Diff is +60.
        // We need to SUBTRACT Diff from candidate.

        const diffMinutes = (plHour * 60 + plMin) - (hour * 60 + minute);

        // Handle day wrap scenario (e.g. 23:00 vs 00:00) generally not an issue for 8-16 range
        // unless offset pushes across midnight. 8-16 safe.

        if (diffMinutes === 0) break;

        candidate = new Date(candidate.getTime() - diffMinutes * 60000);
    }

    return candidate;
}

/**
 * Checks availability for a specific date and group size.
 * Returns a list of valid start times (ISODates).
 */
export async function getAvailableStartTimes(dateStr: string, type: BookingType, peopleCount: number): Promise<string[]> {
    const requestedDuration = DURATION_MINUTES[type];

    // 1. Fetch all bookings for this day
    const startOfDay = new Date(`${dateStr}T00:00:00Z`); // Use Z to force UTC range for search
    const endOfDay = new Date(`${dateStr}T23:59:59Z`);

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
    const monthStr = dateStr.slice(0, 7);
    const globalBlocks = await prisma.globalBlock.findMany({
        where: {
            OR: [
                { type: 'DATE', value: dateStr },
                { type: 'MONTH', value: monthStr }
            ]
        }
    });

    if (globalBlocks.length > 0) {
        return []; // Entire day is blocked
    }

    // 3. Generate all potential start slots (8:00 to 16:00 - duration)
    const validStartTimes: string[] = [];

    // Loop from OPENING_HOUR to CLOSING_HOUR - duration
    // We verify strict OPEN-CLOSE window.
    // e.g. Open 8:00, Close 16:00.
    // Workshop (80min): Last start 14:40 (ends 16:00). 14:45 ends 16:05 (Invalid).

    // Iterate in 15 min steps
    // We start at 8:00 Warsaw Time
    let currentTime = getWarsawStart(dateStr, OPENING_HOUR, 0);

    // We need to determine the End Limit (16:00 Warsaw)
    const closingTime = getWarsawStart(dateStr, CLOSING_HOUR, 0);
    // Adjust closing time by removing duration
    const latestStartTime = new Date(closingTime.getTime() - requestedDuration * 60000);

    while (currentTime <= latestStartTime) {
        const potentialStart = new Date(currentTime);
        const potentialEnd = new Date(potentialStart.getTime() + requestedDuration * 60000);

        // Check 1: Capacity Constraint (The "Tetris" check)
        const isOverbooked = checkResourceOverlap(potentialStart, potentialEnd, peopleCount, existingBookings);

        if (!isOverbooked) {
            validStartTimes.push(potentialStart.toISOString());
        }

        // Increment by 15 mins
        currentTime = new Date(currentTime.getTime() + SLOT_INTERVAL_MINUTES * 60000);
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
    const monthStr = dateStr.slice(0, 7); // YYYY-MM

    const globalBlocks = await prisma.globalBlock.findMany({
        where: {
            OR: [
                { type: 'DATE', value: dateStr },
                { type: 'MONTH', value: monthStr }
            ]
        }
    });

    if (globalBlocks.length > 0) {
        return { valid: false, error: 'Wybrany termin jest zablokowany przez administratora.' };
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
