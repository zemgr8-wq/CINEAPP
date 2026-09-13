'use client';

import React from 'react';
import { Monitor, ChevronRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { Movie, Showtime } from '@/lib/data';
import { AuditoriumSeat, getOrCreateShowtimeSeats } from '@/lib/booking-store';

interface Props {
  movie: Movie;
  showtime: Showtime;
  selectedSeats: string[];
  onToggleSeat: (seat: AuditoriumSeat) => void;
  onProceed: () => void;
  onBack: () => void;
  onTestConcurrency: () => void;
  errorMessage: string | null;
  currentUserId: string;
}

export default function SeatPicker({
  movie,
  showtime,
  selectedSeats,
  onToggleSeat,
  onProceed,
  onBack,
  onTestConcurrency,
  errorMessage,
  currentUserId
}: Props) {
  const seats = getOrCreateShowtimeSeats(showtime);

  let subtotalCents = 0;
  selectedSeats.forEach(label => {
    const s = seats.find(item => item.label === label);
    if (s) subtotalCents += s.priceCents;
  });

  return (
    <div className="bg-[#12151e] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-8">
      {/* Header info */}
      <div className="flex flex-wrap justify-between items-start gap-4 pb-6 border-b border-slate-800">
        <div>
          <button
            onClick={onBack}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-2"
          >
            &larr; Back to movies
          </button>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            {movie.title}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
            <span className="text-amber-400 font-semibold">{showtime.screenType}</span>
            <span>•</span>
            <span>Horizon IMAX Grand Mall</span>
            <span>•</span>
            <span>{new Date(showtime.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Today)</span>
          </div>
        </div>

        {/* Concurrency QA Button */}
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={onTestConcurrency}
            className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium flex items-center gap-1.5 transition"
            title="Tests Agent 3 QA requirement: simultaneous booking attempt on the same seat"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Test Double-Booking Race Condition</span>
          </button>
          <span className="text-[10px] text-slate-500 font-mono">Agent 3 Concurrency Guard</span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Screen perspective arc */}
      <div className="space-y-2 text-center py-2">
        <div className="w-3/4 max-w-lg mx-auto h-3 bg-gradient-to-r from-transparent via-cyan-500 to-transparent rounded-full blur-[1px]" />
        <div className="w-4/5 max-w-xl mx-auto h-8 border-t-2 border-cyan-400/50 rounded-[100%] shadow-[0_-10px_25px_rgba(6,182,212,0.15)] flex items-center justify-center">
          <span className="text-[11px] uppercase tracking-widest text-slate-400 font-mono flex items-center gap-1">
            <Monitor className="w-3.5 h-3.5 text-cyan-400" />
            Auditorium Screen
          </span>
        </div>
      </div>

      {/* Interactive Seat Grid */}
      <div className="max-w-xl mx-auto overflow-x-auto pb-4">
        <div className="grid gap-2.5 justify-center min-w-[340px]">
          {['A', 'B', 'C', 'D', 'E', 'F'].map(rowLabel => {
            const seatsInRow = seats.filter(s => s.row === rowLabel);
            return (
              <div key={rowLabel} className="flex items-center gap-2">
                <span className="w-5 text-xs text-slate-500 font-mono font-bold text-center">
                  {rowLabel}
                </span>
                <div className="flex gap-2">
                  {seatsInRow.map(seat => {
                    const isSelected = selectedSeats.includes(seat.label);
                    const isBooked = seat.state === 'BOOKED';
                    const isHeld = seat.state === 'HELD' && seat.heldBy !== currentUserId;

                    let seatColor = 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700';
                    if (seat.tier === 'VIP') {
                      seatColor = 'bg-amber-950/40 text-amber-300 border-amber-600/40 hover:bg-amber-900/60';
                    } else if (seat.tier === 'ACCESSIBLE') {
                      seatColor = 'bg-blue-950/40 text-blue-300 border-blue-600/40 hover:bg-blue-900/60';
                    }

                    if (isSelected) {
                      seatColor = 'bg-amber-500 text-black font-bold border-amber-300 shadow-lg shadow-amber-500/30 scale-105';
                    } else if (isBooked) {
                      seatColor = 'bg-slate-900 text-slate-600 border-slate-900 cursor-not-allowed opacity-40';
                    } else if (isHeld) {
                      seatColor = 'bg-red-950/50 text-red-500 border-red-800/40 cursor-not-allowed animate-pulse';
                    }

                    return (
                      <button
                        key={seat.id}
                        disabled={isBooked || isHeld}
                        onClick={() => onToggleSeat(seat)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs flex items-center justify-center border font-mono transition duration-150 ${seatColor}`}
                        title={`${seat.label} - ${seat.tier} ($${seat.priceCents / 100})`}
                      >
                        {seat.col}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Seat Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 pt-4 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-slate-800 border border-slate-700"></span>
          <span>Standard (${showtime.priceStandardCents / 100})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-amber-950/50 border border-amber-500"></span>
          <span>VIP Recliner (${showtime.priceVipCents / 100})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-amber-500 border border-amber-300"></span>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-slate-900 border border-slate-900 opacity-40"></span>
          <span>Sold Out</span>
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="bg-[#090a0f] border border-slate-800 p-4 rounded-2xl flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="text-xs text-slate-400 block">Selected Seats:</span>
          <div className="flex items-center gap-2">
            {selectedSeats.length > 0 ? (
              selectedSeats.map(s => (
                <span key={s} className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono text-xs font-bold border border-amber-500/30">
                  {s}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No seats selected yet</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div>
            <span className="text-xs text-slate-400 block">Subtotal:</span>
            <span className="text-lg font-black text-white font-mono">
              ${(subtotalCents / 100).toFixed(2)}
            </span>
          </div>

          <button
            disabled={selectedSeats.length === 0}
            onClick={onProceed}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition"
          >
            <span>Lock Seats & Checkout</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
