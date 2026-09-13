'use client';

import React from 'react';
import { Clock, CreditCard, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Movie, Showtime } from '@/lib/data';

interface Props {
  movie: Movie;
  showtime: Showtime;
  selectedSeats: string[];
  holdTimerSeconds: number;
  isProcessing: boolean;
  onPay: () => void;
  onChangeSeats: () => void;
  currentUser: { name: string; email: string };
  breakdown: { subtotal: number; fees: number; tax: number; total: number };
}

export default function CheckoutModal({
  movie,
  showtime,
  selectedSeats,
  holdTimerSeconds,
  isProcessing,
  onPay,
  onChangeSeats,
  currentUser,
  breakdown
}: Props) {
  return (
    <div className="max-w-2xl mx-auto bg-[#12151e] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-white">Order Checkout</h2>
          <p className="text-xs text-slate-400">Review your ticket summary and complete payment</p>
        </div>

        {/* Hold Expiration Timer */}
        <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold flex items-center gap-1.5">
          <Clock className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
          <span>
            Hold: {Math.floor(holdTimerSeconds / 60)}:{String(holdTimerSeconds % 60).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Movie & Showtime Recap */}
      <div className="flex gap-4 p-4 rounded-2xl bg-[#090a0f] border border-slate-800/80">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-16 h-24 object-cover rounded-lg shadow-md"
        />
        <div className="space-y-1">
          <h3 className="font-bold text-white text-base">{movie.title}</h3>
          <p className="text-xs text-slate-400">Horizon IMAX • Auditorium 1</p>
          <p className="text-xs text-amber-400 font-mono font-medium">
            {new Date(showtime.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {showtime.screenType}
          </p>
          <p className="text-xs text-slate-300 font-mono">
            Seats: <strong>{selectedSeats.join(', ')}</strong> ({selectedSeats.length} tickets)
          </p>
        </div>
      </div>

      {/* Itemized Price Breakdown */}
      <div className="space-y-2.5 p-4 rounded-2xl bg-[#090a0f] border border-slate-800/80 text-xs">
        <div className="flex justify-between text-slate-300">
          <span>Tickets Subtotal ({selectedSeats.length} seats)</span>
          <span className="font-mono font-semibold">${breakdown.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-slate-300">
          <span>Cinema Convenience Fee ($1.50/seat)</span>
          <span className="font-mono font-semibold">${breakdown.fees.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-slate-300">
          <span>State & Local Tax (8.25%)</span>
          <span className="font-mono font-semibold">${breakdown.tax.toFixed(2)}</span>
        </div>
        <div className="pt-2.5 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
          <span>Final Total (USD)</span>
          <span className="text-amber-400 font-mono text-base">${breakdown.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Test Payment Provider Card Simulator */}
      <div className="space-y-4 p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-[#141824] border border-slate-700">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-amber-400" />
            Stripe Test Mode Gateway
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
            Idempotency Protected
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Cardholder Name</label>
            <input
              type="text"
              defaultValue={currentUser.name}
              className="w-full bg-[#090a0f] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Card Number (Test Mode)</label>
            <input
              type="text"
              defaultValue="4242 •••• •••• 4242"
              readOnly
              className="w-full bg-[#090a0f] border border-slate-800 rounded-lg px-3 py-2 text-amber-300 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Expires</label>
              <input
                type="text"
                defaultValue="12/28"
                readOnly
                className="w-full bg-[#090a0f] border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">CVC</label>
              <input
                type="text"
                defaultValue="737"
                readOnly
                className="w-full bg-[#090a0f] border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onChangeSeats}
          className="w-1/3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition"
        >
          Change Seats
        </button>
        <button
          disabled={isProcessing}
          onClick={onPay}
          className="w-2/3 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Processing Payment...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Authorize & Pay ${breakdown.total.toFixed(2)}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
