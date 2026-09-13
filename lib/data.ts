// CineBook Cinema Data Models and Preloaded Data
export interface Movie {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  posterUrl: string;
  backdropUrl: string;
  durationMins: number;
  rating: string;
  imdbRating: number;
  language: string;
  releaseDate: string;
  director: string;
  cast: string[];
  genres: string[];
  featured?: boolean;
}

export interface Cinema {
  id: string;
  name: string;
  city: string;
  address: string;
  screenTypes: string[];
}

export interface Auditorium {
  id: string;
  cinemaId: string;
  name: string;
  screenType: string;
  totalRows: number;
  totalCols: number;
}

export interface Showtime {
  id: string;
  movieId: string;
  cinemaId: string;
  auditoriumId: string;
  startTime: string;
  endTime: string;
  screenType: string;
  priceStandardCents: number;
  priceVipCents: number;
}

export interface Booking {
  id: string;
  reference: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  showtimeId: string;
  movieTitle: string;
  moviePoster: string;
  cinemaName: string;
  auditoriumName: string;
  screenType: string;
  showtime: string;
  seatNumbers: string[];
  subtotalCents: number;
  feeCents: number;
  taxCents: number;
  totalCents: number;
  status: 'CONFIRMED' | 'CANCELLED' | 'REFUNDED';
  paymentId: string;
  createdAt: string;
  qrPayload: string;
}

export const INITIAL_MOVIES: Movie[] = [
  {
    id: 'm-1',
    title: 'Dune: Part Two',
    slug: 'dune-part-two',
    tagline: 'Long live the fighters.',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he must prevent a terrible future only he can foresee.',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
    durationMins: 166,
    rating: 'PG-13',
    imdbRating: 8.6,
    language: 'English',
    releaseDate: '2024-03-01',
    director: 'Denis Villeneuve',
    cast: ['Timoth?e Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem'],
    genres: ['Sci-Fi', 'Adventure', 'Action'],
    featured: true
  },
  {
    id: 'm-2',
    title: 'Oppenheimer',
    slug: 'oppenheimer',
    tagline: 'The world forever changes.',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, exploring profound moral dilemmas.',
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop',
    durationMins: 180,
    rating: 'R',
    imdbRating: 8.9,
    language: 'English',
    releaseDate: '2023-07-21',
    director: 'Christopher Nolan',
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
    genres: ['Biography', 'Drama', 'History'],
    featured: true
  },
  {
    id: 'm-3',
    title: 'Spider-Man: Beyond the Spider-Verse',
    slug: 'spider-man-beyond-the-spider-verse',
    tagline: 'Across every dimension, destiny awaits.',
    description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
    posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1600&auto=format&fit=crop',
    durationMins: 140,
    rating: 'PG',
    imdbRating: 8.8,
    language: 'English',
    releaseDate: '2025-05-15',
    director: 'Joaquim Dos Santos',
    cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac'],
    genres: ['Animation', 'Action', 'Adventure'],
    featured: false
  },
  {
    id: 'm-4',
    title: 'Interstellar (10th Anniversary IMAX)',
    slug: 'interstellar-imax',
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity survival amidst global crop blights.',
    posterUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1600&auto=format&fit=crop',
    durationMins: 169,
    rating: 'PG-13',
    imdbRating: 8.7,
    language: 'English',
    releaseDate: '2014-11-07',
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
    genres: ['Sci-Fi', 'Drama', 'Adventure'],
    featured: false
  },
  {
    id: 'm-5',
    title: 'Neon Ronin: Tokyo 2099',
    slug: 'neon-ronin',
    tagline: 'Honor has a byte limit.',
    description: 'In a rain-drenched cyberpunk metropolis, an exiled cybernetic samurai undertakes a high-stakes heist against the world largest mega-corporation.',
    posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    durationMins: 128,
    rating: 'R',
    imdbRating: 8.4,
    language: 'Japanese / English Sub',
    releaseDate: '2025-08-20',
    director: 'Shinji Mikami',
    cast: ['Hiroyuki Sanada', 'Rinko Kikuchi', 'Ken Watanabe'],
    genres: ['Action', 'Sci-Fi', 'Thriller'],
    featured: false
  },
  {
    id: 'm-6',
    title: 'Gladiator II',
    slug: 'gladiator-ii',
    tagline: 'What we do in life echoes in eternity.',
    description: 'Years after witnessing the death of Maximus, Lucius enters the Colosseum to restore honor to Rome.',
    posterUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1600&auto=format&fit=crop',
    durationMins: 148,
    rating: 'R',
    imdbRating: 7.8,
    language: 'English',
    releaseDate: '2024-11-22',
    director: 'Ridley Scott',
    cast: ['Paul Mescal', 'Pedro Pascal', 'Denzel Washington'],
    genres: ['Action', 'Drama', 'Adventure'],
    featured: false
  }
];

export const INITIAL_CINEMAS: Cinema[] = [
  {
    id: 'c-1',
    name: 'CineBook Horizon IMAX - Grand Mall',
    city: 'Downtown Metropolis',
    address: '742 Grand Boulevard, Level 4',
    screenTypes: ['IMAX Laser', 'Dolby Atmos', 'Luxury Suite']
  },
  {
    id: 'c-2',
    name: 'CineBook Starlight Cinema - West End',
    city: 'Westside District',
    address: '108 Ocean Promenade',
    screenTypes: ['Dolby Atmos', 'Standard Digital']
  },
  {
    id: 'c-3',
    name: 'CineBook Apex Luxe Suites',
    city: 'Financial Center',
    address: '500 Wall Street Galleria',
    screenTypes: ['Luxury Suite', 'IMAX Laser']
  }
];

export const INITIAL_AUDITORIUMS: Auditorium[] = [
  { id: 'a-1', cinemaId: 'c-1', name: 'Auditorium 1 (IMAX Laser)', screenType: 'IMAX Laser', totalRows: 6, totalCols: 10 },
  { id: 'a-2', cinemaId: 'c-1', name: 'Auditorium 2 (Dolby Atmos)', screenType: 'Dolby Atmos', totalRows: 5, totalCols: 8 },
  { id: 'a-3', cinemaId: 'c-2', name: 'Hall A (Dolby Atmos)', screenType: 'Dolby Atmos', totalRows: 5, totalCols: 8 }
];

export const INITIAL_SHOWTIMES: Showtime[] = [
  { id: 'st-1', movieId: 'm-1', cinemaId: 'c-1', auditoriumId: 'a-1', startTime: '2026-09-13T14:30:00Z', endTime: '2026-09-13T17:16:00Z', screenType: 'IMAX Laser', priceStandardCents: 1850, priceVipCents: 2600 },
  { id: 'st-2', movieId: 'm-1', cinemaId: 'c-1', auditoriumId: 'a-1', startTime: '2026-09-13T18:00:00Z', endTime: '2026-09-13T20:46:00Z', screenType: 'IMAX Laser', priceStandardCents: 2000, priceVipCents: 2800 },
  { id: 'st-3', movieId: 'm-1', cinemaId: 'c-1', auditoriumId: 'a-1', startTime: '2026-09-13T21:30:00Z', endTime: '2026-09-14T00:16:00Z', screenType: 'IMAX Laser', priceStandardCents: 2000, priceVipCents: 2800 },
  { id: 'st-4', movieId: 'm-2', cinemaId: 'c-1', auditoriumId: 'a-2', startTime: '2026-09-13T15:00:00Z', endTime: '2026-09-13T18:00:00Z', screenType: 'Dolby Atmos', priceStandardCents: 1700, priceVipCents: 2400 },
  { id: 'st-5', movieId: 'm-2', cinemaId: 'c-1', auditoriumId: 'a-2', startTime: '2026-09-13T19:00:00Z', endTime: '2026-09-13T22:00:00Z', screenType: 'Dolby Atmos', priceStandardCents: 1850, priceVipCents: 2500 },
  { id: 'st-6', movieId: 'm-3', cinemaId: 'c-2', auditoriumId: 'a-3', startTime: '2026-09-13T16:00:00Z', endTime: '2026-09-13T18:20:00Z', screenType: 'Dolby Atmos', priceStandardCents: 1600, priceVipCents: 2200 },
  { id: 'st-7', movieId: 'm-4', cinemaId: 'c-1', auditoriumId: 'a-1', startTime: '2026-09-14T19:30:00Z', endTime: '2026-09-14T22:19:00Z', screenType: 'IMAX Laser', priceStandardCents: 2100, priceVipCents: 2900 },
  { id: 'st-8', movieId: 'm-5', cinemaId: 'c-2', auditoriumId: 'a-3', startTime: '2026-09-13T20:30:00Z', endTime: '2026-09-13T22:38:00Z', screenType: 'Dolby Atmos', priceStandardCents: 1750, priceVipCents: 2400 }
];
