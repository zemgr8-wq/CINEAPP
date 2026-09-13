'use client';

import React from 'react';
import { Film, Ticket, Settings } from 'lucide-react';

interface Props {
  activeTab: 'movies' | 'bookings' | 'admin';
  setActiveTab: (tab: 'movies' | 'bookings' | 'admin') => void;
  bookingCount: number;
  currentUser: { id: string; name: string; email: string; role: 'USER' | 'ADMIN' };
  setCurrentUser: React.Dispatch<React.SetStateAction<{ id: string; name: string; email: string; role: 'USER' | 'ADMIN' }>>;
}

export default function Navbar({ activeTab, setActiveTab, bookingCount, currentUser, setCurrentUser }: Props) {
  return (
    <>
      {/* Top Banner Status */}
      <header className="bg-[#12151e] border-b border-slate-800 text-xs px-4 py-2 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Neon Serverless PostgreSQL (Pooled)</span>
          <span className="text-slate-600">|</span>
          <span>Drizzle ORM</span>
          <span className="text-slate-600">|</span>
          <span className="text-amber-400">Test Mode Gateway</span>
        </div>

        {/* Demo User Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Role:</span>
          <button
            onClick={() => setCurrentUser({
              id: 'user-alex',
              name: 'Alex Morgan',
              email: 'alex.morgan@cinebook.dev',
              role: 'USER'
            })}
            className={`px-2 py-0.5 rounded text-xs transition ${
              currentUser.role === 'USER' 
                ? 'bg-amber-500 text-black font-semibold' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Moviegoer (Alex)
          </button>
          <button
            onClick={() => setCurrentUser({
              id: 'admin-1',
              name: 'Cinema Admin',
              email: 'admin@cinebook.com',
              role: 'ADMIN'
            })}
            className={`px-2 py-0.5 rounded text-xs transition ${
              currentUser.role === 'ADMIN' 
                ? 'bg-cyan-500 text-black font-semibold' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Admin (Operator)
          </button>
        </div>
      </header>

      {/* Main Navigation */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-[#090a0f]/80 border-b border-slate-800/80 px-4 lg:px-8 py-3.5 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('movies')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Film className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="text-xl font-black tracking-wider flex items-center gap-1">
              <span>CINE</span>
              <span className="text-amber-400">BOOK</span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-1 font-mono uppercase tracking-widest">Next-Gen Cinema</p>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={() => setActiveTab('movies')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
              activeTab === 'movies' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Movies</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 relative ${
              activeTab === 'bookings' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>My Bookings</span>
            {bookingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-amber-500 text-black font-bold">
                {bookingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
              activeTab === 'admin' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Admin</span>
          </button>
        </div>
      </nav>
    </>
  );
}
