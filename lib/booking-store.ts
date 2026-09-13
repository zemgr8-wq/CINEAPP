import { Booking, INITIAL_SHOWTIMES, Showtime } from './data';

export type SeatTier = 'VIP' | 'STANDARD' | 'ACCESSIBLE';
export type SeatState = 'AVAILABLE' | 'HELD' | 'BOOKED' | 'BLOCKED';

export interface AuditoriumSeat {
  id: string;
  row: string;
  col: number;
  label: string;
  tier: SeatTier;
  state: SeatState;
  priceCents: number;
  heldBy?: string;
  holdExpiresAt?: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  entityType: string;
  entityId: string;
  userId?: string;
  metadata?: Record<string, any>;
}

// Global in-memory state across requests
const showtimeSeatsMap: Record<string, AuditoriumSeat[]> = {};
const bookingsList: Booking[] = [
  {
    id: 'b-demo-1',
    reference: 'CB-782910',
    userId: 'user-demo',
    customerName: 'Alex Morgan',
    customerEmail: 'alex.morgan@cinebook.dev',
    showtimeId: 'st-1',
    movieTitle: 'Dune: Part Two',
    moviePoster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
    cinemaName: 'CineBook Horizon IMAX - Grand Mall',
    auditoriumName: 'Auditorium 1 (IMAX Laser)',
    screenType: 'IMAX Laser',
    showtime: '2026-09-13T14:30:00Z',
    seatNumbers: ['B4', 'B5'],
    subtotalCents: 5200,
    feeCents: 300,
    taxCents: 454,
    totalCents: 5954,
    status: 'CONFIRMED',
    paymentId: 'pi_test_89234710',
    createdAt: '2026-09-13T09:00:00Z',
    qrPayload: 'CINEBOOK:CB-782910:st-1:B4,B5'
  }
];

const auditLogs: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-09-13T09:00:00Z',
    action: 'BOOKING_CONFIRMED',
    entityType: 'booking',
    entityId: 'b-demo-1',
    userId: 'user-demo',
    metadata: { seats: ['B4', 'B5'], totalCents: 5954, reference: 'CB-782910' }
  }
];

export function getOrCreateShowtimeSeats(showtime: Showtime): AuditoriumSeat[] {
  if (showtimeSeatsMap[showtime.id]) {
    const now = Date.now();
    showtimeSeatsMap[showtime.id].forEach(s => {
      if (s.state === 'HELD' && s.holdExpiresAt && s.holdExpiresAt < now) {
        s.state = 'AVAILABLE';
        delete s.heldBy;
        delete s.holdExpiresAt;
      }
    });
    return showtimeSeatsMap[showtime.id];
  }

  const seats: AuditoriumSeat[] = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const cols = 10;

  rows.forEach(row => {
    for (let c = 1; c <= cols; c++) {
      const label = `${row}${c}`;
      let tier: SeatTier = 'STANDARD';
      let price = showtime.priceStandardCents;

      if (row === 'A' || row === 'B') {
        tier = 'VIP';
        price = showtime.priceVipCents;
      } else if (row === 'F' && (c === 1 || c === 10)) {
        tier = 'ACCESSIBLE';
        price = Math.round(showtime.priceStandardCents * 0.85);
      }

      let state: SeatState = 'AVAILABLE';
      if ((row === 'B' && (c === 4 || c === 5)) && showtime.id === 'st-1') {
        state = 'BOOKED';
      } else if ((row === 'C' && (c === 6 || c === 7)) && showtime.id === 'st-1') {
        state = 'BOOKED';
      }

      seats.push({
        id: `${showtime.id}-${label}`,
        row,
        col: c,
        label,
        tier,
        state,
        priceCents: price
      });
    }
  });

  showtimeSeatsMap[showtime.id] = seats;
  return seats;
}

export function holdSeatsTransaction(
  showtimeId: string,
  seatLabels: string[],
  userId: string,
  holdMinutes: number = 10
): { success: boolean; error?: string; holdExpiresAt?: number } {
  const showtime = INITIAL_SHOWTIMES.find(s => s.id === showtimeId);
  if (!showtime) return { success: false, error: 'Showtime not found.' };

  const seats = getOrCreateShowtimeSeats(showtime);
  const now = Date.now();
  const holdExpiry = now + holdMinutes * 60 * 1000;

  // Atomic verification of requested seats
  for (const label of seatLabels) {
    const seat = seats.find(s => s.label === label);
    if (!seat) {
      return { success: false, error: `Seat ${label} does not exist.` };
    }
    if (seat.state === 'BOOKED') {
      return { success: false, error: `Seat ${label} is already booked.` };
    }
    if (seat.state === 'HELD' && seat.heldBy !== userId && seat.holdExpiresAt && seat.holdExpiresAt > now) {
      return { success: false, error: `Seat ${label} is currently held by another user.` };
    }
  }

  // Atomic update
  for (const label of seatLabels) {
    const seat = seats.find(s => s.label === label)!;
    seat.state = 'HELD';
    seat.heldBy = userId;
    seat.holdExpiresAt = holdExpiry;
  }

  auditLogs.unshift({
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
    action: 'SEATS_HELD',
    entityType: 'showtime_seats',
    entityId: showtimeId,
    userId,
    metadata: { seats: seatLabels, expiresAt: new Date(holdExpiry).toISOString() }
  });

  return { success: true, holdExpiresAt: holdExpiry };
}

export function confirmBookingTransaction(data: {
  showtime: Showtime;
  movieTitle: string;
  moviePoster: string;
  cinemaName: string;
  auditoriumName: string;
  seatLabels: string[];
  userId: string;
  customerName: string;
  customerEmail: string;
  idempotencyKey?: string;
}): { success: boolean; booking?: Booking; error?: string } {
  const { showtime, seatLabels, userId } = data;
  const seats = getOrCreateShowtimeSeats(showtime);
  const now = Date.now();

  for (const label of seatLabels) {
    const seat = seats.find(s => s.label === label);
    if (!seat) return { success: false, error: `Invalid seat ${label}.` };
    if (seat.state === 'BOOKED') {
      return { success: false, error: `Seat ${label} has already been confirmed.` };
    }
    if (seat.state === 'HELD' && seat.heldBy && seat.heldBy !== userId && seat.holdExpiresAt && seat.holdExpiresAt > now) {
      return { success: false, error: `Seat ${label} is held by another user.` };
    }
  }

  let subtotalCents = 0;
  seatLabels.forEach(label => {
    const seat = seats.find(s => s.label === label)!;
    subtotalCents += seat.priceCents;
  });

  const feeCents = seatLabels.length * 150;
  const taxCents = Math.round(subtotalCents * 0.0825);
  const totalCents = subtotalCents + feeCents + taxCents;

  seatLabels.forEach(label => {
    const seat = seats.find(s => s.label === label)!;
    seat.state = 'BOOKED';
    delete seat.heldBy;
    delete seat.holdExpiresAt;
  });

  const refCode = 'CB-' + Math.floor(100000 + Math.random() * 900000);
  const booking: Booking = {
    id: 'b-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    reference: refCode,
    userId: data.userId,
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    showtimeId: showtime.id,
    movieTitle: data.movieTitle,
    moviePoster: data.moviePoster,
    cinemaName: data.cinemaName,
    auditoriumName: data.auditoriumName,
    screenType: showtime.screenType,
    showtime: showtime.startTime,
    seatNumbers: seatLabels,
    subtotalCents,
    feeCents,
    taxCents,
    totalCents,
    status: 'CONFIRMED',
    paymentId: 'pi_test_' + Math.random().toString(36).substring(2, 10),
    createdAt: new Date().toISOString(),
    qrPayload: `CINEBOOK:${refCode}:${showtime.id}:${seatLabels.join(',')}`
  };

  bookingsList.unshift(booking);

  auditLogs.unshift({
    id: 'log-' + Date.now(),
    timestamp: new Date().toISOString(),
    action: 'BOOKING_CONFIRMED',
    entityType: 'booking',
    entityId: booking.id,
    userId: data.userId,
    metadata: { reference: refCode, totalCents, seats: seatLabels }
  });

  return { success: true, booking };
}

export function cancelBookingTransaction(bookingId: string, userId: string): { success: boolean; error?: string } {
  const booking = bookingsList.find(b => b.id === bookingId);
  if (!booking) return { success: false, error: 'Booking not found.' };
  if (booking.userId !== userId && userId !== 'admin') {
    return { success: false, error: 'Unauthorized to cancel this booking.' };
  }
  if (booking.status === 'CANCELLED') {
    return { success: false, error: 'Booking is already cancelled.' };
  }

  booking.status = 'CANCELLED';

  const showtimeSeats = showtimeSeatsMap[booking.showtimeId];
  if (showtimeSeats) {
    booking.seatNumbers.forEach(label => {
      const seat = showtimeSeats.find(s => s.label === label);
      if (seat) {
        seat.state = 'AVAILABLE';
        delete seat.heldBy;
        delete seat.holdExpiresAt;
      }
    });
  }

  auditLogs.unshift({
    id: 'log-' + Date.now(),
    timestamp: new Date().toISOString(),
    action: 'BOOKING_CANCELLED',
    entityType: 'booking',
    entityId: booking.id,
    userId,
    metadata: { reference: booking.reference, refundedCents: booking.totalCents }
  });

  return { success: true };
}

export function releaseAllExpiredHolds(): { releasedCount: number } {
  let count = 0;
  const now = Date.now();
  Object.values(showtimeSeatsMap).forEach(seats => {
    seats.forEach(s => {
      if (s.state === 'HELD' && s.holdExpiresAt && s.holdExpiresAt < now) {
        s.state = 'AVAILABLE';
        delete s.heldBy;
        delete s.holdExpiresAt;
        count++;
      }
    });
  });

  if (count > 0) {
    auditLogs.unshift({
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      action: 'CRON_RELEASE_HOLDS',
      entityType: 'showtime_seats',
      entityId: 'all',
      metadata: { releasedCount: count }
    });
  }

  return { releasedCount: count };
}

export function getAllBookings(): Booking[] {
  return [...bookingsList];
}

export function getAllAuditLogs(): AuditLog[] {
  return [...auditLogs];
}
