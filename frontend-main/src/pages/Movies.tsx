import { useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MovieCard from '@/components/MovieCard';
import { Input } from '@/components/ui/input';

const Movies = () => {
  const [query, setQuery] = useState('');

  const movies = useMemo(() => ([
    { title: 'Cosmic Odyssey', image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80', rating: 4.8, genre: 'Sci-Fi' },
    { title: 'Shadow Hunter', image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80', rating: 4.6, genre: 'Action' },
    { title: 'Eternal Love', image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80', rating: 4.7, genre: 'Romance' },
    { title: 'Robo Run', image: 'https://images.unsplash.com/photo-1542206395-9feb3edaa68e?w=800&q=80', rating: 4.4, genre: 'Sci-Fi' },
    { title: 'Ocean Deep', image: 'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=800&q=80', rating: 4.3, genre: 'Drama' },
    { title: 'Sky Warriors', image: 'https://images.unsplash.com/photo-1466927591648-b7d2a8589f8b?w=800&q=80', rating: 4.5, genre: 'Action' },
  ]), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return movies;
    return movies.filter(m => m.title.toLowerCase().includes(q) || m.genre?.toLowerCase().includes(q));
  }, [movies, query]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="py-10 px-4">
        <div className="container mx-auto">
          <div className="glass-card p-6 mb-8">
            <h1 className="text-3xl font-bold mb-4">Explore Movies</h1>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies by title or genre"
              className="glass-button h-11"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((movie, idx) => (
              <div key={idx} className="animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                <MovieCard {...movie} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Movies;
