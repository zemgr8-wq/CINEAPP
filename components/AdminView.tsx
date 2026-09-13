'use client';

import React from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { Booking, INITIAL_SHOWTIMES } from '@/lib/data';
import { AuditLog } from '@/lib/booking-store';

interface Props {
  bookings: Booking[];
  auditLogs: AuditLog[];
  cronStatus: string | null;
  isCronRunning: boolean;
  onTriggerCron: () => void;
}

export default function AdminView({
  bookings,
  auditLogs,
  cronStatus,
  isCronRunning,
  onTriggerCron
}: Props) {
  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');
  const grossSales = confirmedBookings.reduce((acc, b) => acc + b.totalCents, 0);
  const totalTickets = confirmedBookings.reduce((acc, b) => acc + b.seatNumbers.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Cinema Operations & Admin</h2>
          <p className="text-xs text-slate-400">Live seat hold management, audit logs, and metrics</p>
        </div>

        {/* Trigger Cron Button */}
        <div className="flex items-center gap-3">
          <button
            disabled={isCronRunning}
            onClick={onTriggerCron}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCronRunning ? 'animate-spin' : ''}`} />
            <span>Release Expired Holds (Cron)</span>
          </button>
        </div>
      </div>

      {cronStatus && (
        <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
          {cronStatus}
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#12151e] border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Gross Ticket Sales</span>
          <p className="text-2xl font-black text-white font-mono">
            ${(grossSales / 100).toFixed(2)}
          </p>
          <span className="text-[10px] text-emerald-400">Live Minor Unit Cents</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#12151e] border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Total Confirmed Tickets</span>
          <p className="text-2xl font-black text-amber-400 font-mono">
            {totalTickets}
          </p>
          <span className="text-[10px] text-slate-500">Across All Showtimes</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#12151e] border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Active Showtimes Today</span>
          <p className="text-2xl font-black text-cyan-400 font-mono">
            {INITIAL_SHOWTIMES.length}
          </p>
          <span className="text-[10px] text-slate-500">3 Screen Formats</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#12151e] border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Database Engine</span>
          <p className="text-lg font-bold text-white font-mono">Neon Serverless</p>
          <span className="text-[10px] text-emerald-400">ACID Concurrency Locks</span>
        </div>
      </div>

      {/* Real-time Audit Log Viewer */}
      <div className="bg-[#12151e] border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Real-Time Audit Log</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">{auditLogs.length} events recorded</span>
        </div>

        <div className="max-h-72 overflow-y-auto space-y-2 pr-2">
          {auditLogs.map(log => (
            <div key={log.id} className="p-3 rounded-xl bg-[#090a0f] border border-slate-800/80 text-xs font-mono flex flex-wrap justify-between items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-bold">
                  {log.action}
                </span>
                <span className="text-slate-400">{log.entityType}: {log.entityId}</span>
              </div>
              <div className="flex items-center gap-4 text-slate-500 text-[11px]">
                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className="text-cyan-400/80">{JSON.stringify(log.metadata || {})}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
