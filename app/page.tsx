'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { 
  Movie, Showtime, Booking, 
  INITIAL_MOVIES, INITIAL_CINEMAS, INITIAL_SHOWTIMES 
} from '@/lib/data';
import { 
  AuditoriumSeat, holdSeatsTransaction, confirmBookingTransaction, 
  cancelBookingTransaction, releaseAllExpiredHolds, getAllBookings, 
  getAllAuditLogs, AuditLog, getOrCreateShowtimeSeats 
} from '@/lib/booking-store';
import Navbar from '@/components/Navbar';
import HeroBanner from '@/components/HeroBanner';
import MovieCard from '@/components/MovieCard';
import SeatPicker from '@/components/SeatPicker';
import CheckoutModal from '@/components/CheckoutModal';
import TicketModal from '@/components/TicketModal';
import BookingsView from '@/components/BookingsView';
import AdminView from '@/components/AdminView';

export default function CineBookHome() {
  const [activeTab, setActiveTab] = useState<'movies' | 'bookings' | 'admin'>('movies');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  const [currentUser, setCurrentUser] = useState({
    id: 'user-alex',
    name: 'Alex Morgan',
    email: 'alex.morgan@cinebook.dev',
    role: 'USER' as 'USER' | 'ADMIN'
  });

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [seatStep, setSeatStep] = useState<'selecting' | 'checkout' | 'ticket' | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [holdExpiresAt, setHoldExpiresAt] = useState<number | null>(null);
  const [holdTimerSeconds, setHoldTimerSeconds] = useState<number>(0);
  const [latestBooking, setLatestBooking] = useState<Booking | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [cronStatus, setCronStatus] = useState<string | null>(null);
  const [isCronRunning, setIsCronRunning] = useState(false);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);

  useEffect(() => {
    setUserBookings(getAllBookings());
    setAuditLogs(getAllAuditLogs());
  }, []);

  // Hold Timer countdown
  useEffect(() => {
    if (!holdExpiresAt) {
      setHoldTimerSeconds(0);
      return;
    }
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((holdExpiresAt - Date.now()) / 1000));
      setHoldTimerSeconds(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        setErrorMessage('Your seat hold has expired. Please re-select seats.');
        setSelectedSeats([]);
        setHoldExpiresAt(null);
        setSeatStep('selecting');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [holdExpiresAt]);

  const featuredMovie = INITIAL_MOVIES.find(m => m.featured) || INITIAL_MOVIES[0];

  const filteredMovies = useMemo(() => {
    return INITIAL_MOVIES.filter(m => {
      const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.cast.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
        m.director.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = selectedGenre === 'All' || m.genres.includes(selectedGenre);
      return matchesSearch && matchesGenre;
    });
  }, [searchQuery, selectedGenre]);

  const handleOpenShowtimes = (movie: Movie, st?: Showtime) => {
    setSelectedMovie(movie);
    const movieShowtimes = INITIAL_SHOWTIMES.filter(s => s.movieId === movie.id);
    setSelectedShowtime(st || movieShowtimes[0] || null);
    setSelectedSeats([]);
    setHoldExpiresAt(null);
    setErrorMessage(null);
    setSeatStep('selecting');
  };

  const handleToggleSeat = (seat: AuditoriumSeat) => {
    if (seat.state === 'BOOKED' || (seat.state === 'HELD' && seat.heldBy !== currentUser.id)) return;
    if (selectedSeats.includes(seat.label)) {
      setSelectedSeats(prev => prev.filter(s => s !== seat.label));
    } else {
      if (selectedSeats.length >= 6) {
        setErrorMessage('Maximum 6 seats allowed per reservation.');
        return;
      }
      setSelectedSeats(prev => [...prev, seat.label]);
    }
    setErrorMessage(null);
  };

  const handleHoldAndProceed = () => {
    if (!selectedShowtime || selectedSeats.length === 0) return;
    const result = holdSeatsTransaction(selectedShowtime.id, selectedSeats, currentUser.id, 10);
    if (!result.success) {
      setErrorMessage(result.error || 'Failed to reserve seats.');
      return;
    }
    setHoldExpiresAt(result.holdExpiresAt || Date.now() + 600000);
    setSeatStep('checkout');
    setErrorMessage(null);
  };

  const handleSimulateConcurrency = () => {
    if (!selectedShowtime || selectedSeats.length === 0) {
      setErrorMessage('Select at least 1 seat first to test double-booking concurrency locking.');
      return;
    }
    const competitorId = 'user-race-condition-' + Math.random().toString(36).substring(2, 5);
    const raceResult = holdSeatsTransaction(selectedShowtime.id, selectedSeats, competitorId, 10);

    if (!raceResult.success) {
      alert(`[QA Concurrency Test PASSED]\nSimulated second user attempt was rejected: "${raceResult.error}"\nRow-level lock prevented double-booking!`);
    } else {
      alert('[QA Test Notice] Seat claimed by competitor.');
    }
  };

  const handleCompletePayment = () => {
    if (!selectedShowtime || !selectedMovie || selectedSeats.length === 0) return;
    setIsProcessingPayment(true);
    setTimeout(() => {
      const cinema = INITIAL_CINEMAS.find(c => c.id === selectedShowtime.cinemaId);
      const result = confirmBookingTransaction({
        showtime: selectedShowtime,
        movieTitle: selectedMovie.title,
        moviePoster: selectedMovie.posterUrl,
        cinemaName: cinema?.name || 'CineBook Cinema',
        auditoriumName: 'Auditorium 1',
        seatLabels: selectedSeats,
        userId: currentUser.id,
        customerName: currentUser.name,
        customerEmail: currentUser.email,
        idempotencyKey: 'idem-' + Date.now()
      });

      setIsProcessingPayment(false);

      if (result.success && result.booking) {
        setLatestBooking(result.booking);
        setUserBookings(getAllBookings());
        setAuditLogs(getAllAuditLogs());
        setSeatStep('ticket');
        setHoldExpiresAt(null);
      } else {
        setErrorMessage(result.error || 'Payment confirmation failed.');
      }
    }, 1000);
  };

  const handleCancelBooking = (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking? Refund will be processed.')) return;
    const res = cancelBookingTransaction(bookingId, currentUser.id);
    if (res.success) {
      setUserBookings(getAllBookings());
      setAuditLogs(getAllAuditLogs());
      alert('Booking cancelled successfully and seats released.');
    } else {
      alert(res.error || 'Cancellation failed.');
    }
  };

  const handleTriggerCron = async () => {
    setIsCronRunning(true);
    setCronStatus('Invoking /api/cron/release-holds...');
    try {
      const res = await fetch('/api/cron/release-holds');
      const data = await res.json();
      setCronStatus(`Success: ${data.message} (${data.releasedCount} seats released)`);
      setAuditLogs(getAllAuditLogs());
    } catch {
      const fallback = releaseAllExpiredHolds();
      setCronStatus(`Processed locally: Released ${fallback.releasedCount} expired holds.`);
      setAuditLogs(getAllAuditLogs());
    } finally {
      setIsCronRunning(false);
    }
  };

  const seatBreakdown = useMemo(() => {
    if (!selectedShowtime) return { subtotal: 0, fees: 0, tax: 0, total: 0 };
    const seats = getOrCreateShowtimeSeats(selectedShowtime);
    let subtotalCents = 0;
    selectedSeats.forEach(label => {
      const s = seats.find(item => item.label === label);
      if (s) subtotalCents += s.priceCents;
    });
    const feeCents = selectedSeats.length * 150;
    const taxCents = Math.round(subtotalCents * 0.0825);
    const totalCents = subtotalCents + feeCents + taxCents;
    return {
      subtotal: subtotalCents / 100,
      fees: feeCents / 100,
      tax: taxCents / 100,
      total: totalCents / 100
    };
  }, [selectedShowtime, selectedSeats]);

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => { setActiveTab(tab); setSeatStep(null); }}
        bookingCount={userBookings.length}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        {activeTab === 'movies' && !seatStep && (
          <>
            <HeroBanner movie={featuredMovie} onBook={(m) => handleOpenShowtimes(m)} />

            {/* Filter Bar */}
            <div className="bg-[#12151e] border border-slate-800/80 p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies, actors, director..."
                  className="w-full bg-[#090a0f] border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                {['All', 'Sci-Fi', 'Action', 'Adventure', 'Drama', 'Biography', 'Animation'].map(genre => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                      selectedGenre === genre
                        ? 'bg-amber-500 text-black font-semibold'
                        : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Movies Catalog */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Now In Theatres</span>
                <span className="text-xs font-normal text-slate-400">({filteredMovies.length} showing)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredMovies.map(movie => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onSelectShowtime={(m, st) => handleOpenShowtimes(m, st)}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Auditorium Seat Map */}
        {activeTab === 'movies' && seatStep === 'selecting' && selectedShowtime && selectedMovie && (
          <SeatPicker
            movie={selectedMovie}
            showtime={selectedShowtime}
            selectedSeats={selectedSeats}
            onToggleSeat={handleToggleSeat}
            onProceed={handleHoldAndProceed}
            onBack={() => setSeatStep(null)}
            onTestConcurrency={handleSimulateConcurrency}
            errorMessage={errorMessage}
            currentUserId={currentUser.id}
          />
        )}

        {/* Checkout Modal */}
        {activeTab === 'movies' && seatStep === 'checkout' && selectedShowtime && selectedMovie && (
          <CheckoutModal
            movie={selectedMovie}
            showtime={selectedShowtime}
            selectedSeats={selectedSeats}
            holdTimerSeconds={holdTimerSeconds}
            isProcessing={isProcessingPayment}
            onPay={handleCompletePayment}
            onChangeSeats={() => setSeatStep('selecting')}
            currentUser={currentUser}
            breakdown={seatBreakdown}
          />
        )}

        {/* Ticket Modal */}
        {activeTab === 'movies' && seatStep === 'ticket' && latestBooking && (
          <TicketModal
            booking={latestBooking}
            onViewAllBookings={() => { setActiveTab('bookings'); setSeatStep(null); }}
          />
        )}

        {/* My Bookings View */}
        {activeTab === 'bookings' && (
          <BookingsView
            bookings={userBookings}
            onBrowseMovies={() => { setActiveTab('movies'); setSeatStep(null); }}
            onCancelBooking={handleCancelBooking}
          />
        )}

        {/* Admin Portal View */}
        {activeTab === 'admin' && (
          <AdminView
            bookings={userBookings}
            auditLogs={auditLogs}
            cronStatus={cronStatus}
            isCronRunning={isCronRunning}
            onTriggerCron={handleTriggerCron}
          />
        )}
      </main>

      <footer className="border-t border-slate-800 bg-[#090a0f] py-8 text-xs text-slate-500 text-center space-y-2">
        <p className="font-semibold text-slate-400">CineBook Production Cinema Ticket Platform</p>
        <p>Next.js App Router • Neon PostgreSQL • Drizzle ORM • Tailwind CSS</p>
      </footer>
    </div>
  );
}
