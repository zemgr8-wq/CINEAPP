import { 
  holdSeatsTransaction, 
  confirmBookingTransaction, 
  releaseAllExpiredHolds, 
  cancelBookingTransaction, 
  getOrCreateShowtimeSeats 
} from '../lib/booking-store';
import { INITIAL_SHOWTIMES, INITIAL_MOVIES, INITIAL_CINEMAS } from '../lib/data';

async function runQASuite() {
  console.log('====================================================');
  console.log('       CINEBOOK AGENT 3 - QA TEST SUITE            ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} ${detail ? '-> ' + detail : ''}`);
      failed++;
    }
  }

  const showtime = INITIAL_SHOWTIMES[0];
  const movie = INITIAL_MOVIES[0];
  const cinema = INITIAL_CINEMAS[0];

  // TEST 1: Concurrency & Double-Booking Prevention
  console.log('--- Test 1: Concurrent Double-Booking Race Condition ---');
  const targetSeat = ['A1'];

  // User 1 holds A1
  const user1Hold = holdSeatsTransaction(showtime.id, targetSeat, 'user-alice', 10);
  assert('User 1 seat hold succeeds', user1Hold.success === true);

  // User 2 attempts to hold the exact same seat concurrently
  const user2Hold = holdSeatsTransaction(showtime.id, targetSeat, 'user-bob', 10);
  assert(
    'User 2 concurrent hold is rejected with conflict', 
    user2Hold.success === false && user2Hold.error?.includes('currently held'),
    user2Hold.error
  );

  // TEST 2: Financial Precision in Minor Unit Integer Cents
  console.log('\n--- Test 2: Financial Precision (Minor Unit Cents) ---');
  const seats = getOrCreateShowtimeSeats(showtime);
  const vipSeat = seats.find(s => s.tier === 'VIP')!;
  const standardSeat = seats.find(s => s.tier === 'STANDARD')!;

  assert('VIP seat price stored as integer cents', Number.isInteger(vipSeat.priceCents) && vipSeat.priceCents > 0);
  assert('Standard seat price stored as integer cents', Number.isInteger(standardSeat.priceCents) && standardSeat.priceCents > 0);

  // TEST 3: Booking Confirmation & Ticket Generation
  console.log('\n--- Test 3: Booking Confirmation & Ticket Generation ---');
  const bookingConfirm = confirmBookingTransaction({
    showtime,
    movieTitle: movie.title,
    moviePoster: movie.posterUrl,
    cinemaName: cinema.name,
    auditoriumName: 'Auditorium 1',
    seatLabels: ['A1'],
    userId: 'user-alice',
    customerName: 'Alice Springs',
    customerEmail: 'alice@example.com',
    idempotencyKey: 'idem-test-123'
  });

  assert('Booking confirmed successfully', bookingConfirm.success === true && !!bookingConfirm.booking);
  if (bookingConfirm.booking) {
    assert('Unique booking reference generated (CB-XXXXXX)', /^CB-\d{6}$/.test(bookingConfirm.booking.reference));
    assert('QR Payload generated for ticket scanning', bookingConfirm.booking.qrPayload.includes('CINEBOOK:'));
    assert(
      'Exact integer arithmetic: Subtotal + Fee + Tax = Total',
      bookingConfirm.booking.subtotalCents + bookingConfirm.booking.feeCents + bookingConfirm.booking.taxCents === bookingConfirm.booking.totalCents
    );
  }

  // Attempt to book already booked seat
  const doubleBookingAttempt = holdSeatsTransaction(showtime.id, ['A1'], 'user-charlie', 10);
  assert('Cannot hold already confirmed/booked seat', doubleBookingAttempt.success === false && doubleBookingAttempt.error?.includes('already booked'));

  // TEST 4: Expired Hold Automatic Release
  console.log('\n--- Test 4: Expired Hold Idempotent Release ---');
  // Hold a seat with 0 minutes expiry (already expired)
  const expiredHold = holdSeatsTransaction(showtime.id, ['D1'], 'user-expired', -1);
  assert('Expired hold registered', expiredHold.success === true);

  const releaseResult = releaseAllExpiredHolds();
  assert('Idempotent cron releases expired hold', releaseResult.releasedCount >= 1);

  const recheckHold = holdSeatsTransaction(showtime.id, ['D1'], 'user-new', 10);
  assert('Seat is immediately available again after hold release', recheckHold.success === true);

  // TEST 5: Cancellation & Seat Release
  console.log('\n--- Test 5: Booking Cancellation & Policy ---');
  if (bookingConfirm.booking) {
    const cancelRes = cancelBookingTransaction(bookingConfirm.booking.id, 'user-alice');
    assert('Booking cancellation succeeds for owner', cancelRes.success === true);
    
    // Check seat A1 is available again
    const seatAfterCancel = getOrCreateShowtimeSeats(showtime).find(s => s.label === 'A1');
    assert('Cancelled seat is returned to AVAILABLE state', seatAfterCancel?.state === 'AVAILABLE');
  }

  console.log('\n====================================================');
  console.log(`QA SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
}

runQASuite().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
