'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Booking } from '@/lib/data';
import QRCodeDisplay from './QRCodeDisplay';

interface Props {
  booking: Booking;
  onViewAllBookings: () => void;
}

export default function TicketModal({ booking, onViewAllBookings }: Props) {
  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center space-y-1">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-white">Booking Confirmed!</h2>
        <p className="text-xs text-slate-400">Your digital cinema ticket is ready to scan at the gate.</p>
      </div>

      {/* Boarding Pass Ticket */}
      <div className="bg-[#12151e] border-2 border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="p-6 space-y-4 border-b border-dashed border-slate-700 relative">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400">Digital Cinema Ticket</span>
              <h3 className="text-xl font-black text-white">{booking.movieTitle}</h3>
              <p className="text-xs text-slate-400">{booking.cinemaName}</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs font-mono font-bold">
              {booking.screenType}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <span className="text-slate-500 block">Showtime</span>
              <span className="font-semibold text-white font-mono">
                {new Date(booking.showtime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Date</span>
              <span className="font-semibold text-white">
                {new Date(booking.showtime).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Seats</span>
              <span className="font-mono font-bold text-amber-400 text-sm">
                {booking.seatNumbers.join(', ')}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Total Paid</span>
              <span className="font-mono font-bold text-white text-sm">
                ${(booking.totalCents / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="p-6 text-center space-y-3 bg-[#0c0e14]">
          <div className="flex justify-center">
            <QRCodeDisplay text={booking.qrPayload} size={150} />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block">Booking Reference</span>
            <span className="text-lg font-mono font-black text-amber-400 tracking-wider">
              {booking.reference}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Present this QR code at Auditorium Entrance.</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => window.print()}
          className="w-1/2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
        >
          Print Ticket
        </button>
        <button
          onClick={onViewAllBookings}
          className="w-1/2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition"
        >
          My Bookings
        </button>
      </div>
    </div>
  );
}
