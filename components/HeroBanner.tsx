'use client';

import React from 'react';
import { Sparkles, Ticket, Star, Clock } from 'lucide-react';
import { Movie } from '@/lib/data';

interface Props {
  movie: Movie;
  onBook: (movie: Movie) => void;
}

export default function HeroBanner({ movie, onBook }: Props) {
  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-[#12151e]">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-35 blur-[1px] scale-105 transition-transform duration-1000"
        style={{ backgroundImage: `url(${movie.backdropUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/60 to-transparent" />
      
      <div className="relative z-10 p-6 md:p-10 lg:p-12 flex flex-col md:flex-row gap-8 items-start md:items-end justify-between">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Now Showing in IMAX Laser
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            {movie.title}
          </h1>

          <p className="text-amber-300 font-medium italic text-sm md:text-base">
            "{movie.tagline}"
          </p>

          <p className="text-slate-300 text-sm md:text-base line-clamp-3 leading-relaxed">
            {movie.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300">
            <span className="flex items-center gap-1 text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
              <strong className="text-white text-sm">{movie.imdbRating}</strong> / 10
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {movie.durationMins} mins
            </span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
              {movie.rating}
            </span>
            <span>•</span>
            <span>{movie.language}</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {movie.genres.map(g => (
              <span key={g} className="text-xs px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300">
                {g}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={() => onBook(movie)}
            className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition transform active:scale-95"
          >
            <Ticket className="w-4 h-4" />
            <span>Book Tickets</span>
          </button>
        </div>
      </div>
    </div>
  );
}
