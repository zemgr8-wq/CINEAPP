'use client';

import React from 'react';
import { Star, Clock } from 'lucide-react';
import { Movie, Showtime, INITIAL_SHOWTIMES } from '@/lib/data';

interface Props {
  movie: Movie;
  onSelectShowtime: (movie: Movie, showtime: Showtime) => void;
}

export default function MovieCard({ movie, onSelectShowtime }: Props) {
  const movieShowtimes = INITIAL_SHOWTIMES.filter(s => s.movieId === movie.id);

  return (
    <div className="group bg-[#12151e] border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-lg transition duration-300 flex flex-col">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
        <img
          src={movie.backdropUrl || movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12151e] via-transparent to-transparent" />
        
        <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-amber-400 font-bold text-xs flex items-center gap-1 border border-white/10">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span>{movie.imdbRating}</span>
        </div>

        <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-slate-300 text-xs font-medium border border-white/10">
          {movie.rating}
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300 font-medium">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            {movie.durationMins}m
          </span>
          <span>{movie.language}</span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition">
            {movie.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 mt-1">
            {movie.description}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {movie.genres.map(g => (
              <span key={g} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                {g}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium">
            <span>Showtimes:</span>
            <span className="text-amber-400 font-mono">from ${(movieShowtimes[0]?.priceStandardCents || 1800) / 100}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {movieShowtimes.map(st => {
              const timeStr = new Date(st.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <button
                  key={st.id}
                  onClick={() => onSelectShowtime(movie, st)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-black text-xs font-semibold text-slate-200 border border-slate-700 transition flex items-center gap-1"
                >
                  <span>{timeStr}</span>
                  <span className="text-[10px] opacity-70 font-normal">({st.screenType})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
