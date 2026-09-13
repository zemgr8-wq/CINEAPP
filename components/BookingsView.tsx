'use client';

import React from 'react';
import { Ticket, Trash2 } from 'lucide-react';
import { Booking } from '@/lib/data';

interface Props {
  bookings: Booking[];
  onBrowseMovies: () => void;
  onCancelBooking: (id: string) => void;
}

export default function BookingsView({ bookings, onBrowseMovies, onCancelBooking }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white">My Booking History</h2>
          <p className="text-xs text-slate-400">View upcoming tickets, download passes, or cancel bookings</p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-mono">
          {bookings.length} total bookings
        </span>
      </div>

      {bookings.length === 0 ? (
        <div className="p-12 text-center bg-[#12151e] border border-slate-800 rounded-3xl space-y-4">
          <Ticket className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Bookings Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Browse our currently showing blockbusters and reserve your seats with zero hassle.
          </p>
          <button
            onClick={onBrowseMovies}
            className="px-6 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs"
          >
            Browse Movies
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map(b => (
            <div
              key={b.id}
              className="p-5 bg-[#12151e] border border-slate-800 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-700 transition"
            >
              <div className="flex items-center gap-4">
                <img
                  src={b.moviePoster}
                  alt={b.movieTitle}
                  className="w-14 h-20 object-cover rounded-lg shadow"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-base">{b.movieTitle}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                      b.status === 'CONFIRMED' 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{b.cinemaName} • {b.screenType}</p>
                  <p className="text-xs text-amber-400 font-mono">
                    Seats: <strong>{b.seatNumbers.join(', ')}</strong> • Ref: {b.reference}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Showtime: {new Date(b.showtime).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Total</span>
                  <span className="font-mono font-bold text-white text-base">
                    ${(b.totalCents / 100).toFixed(2)}
                  </span>
                </div>

                {b.status === 'CONFIRMED' && (
                  <button
                    onClick={() => onCancelBooking(b.id)}
                    className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Cancel & Refund</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
