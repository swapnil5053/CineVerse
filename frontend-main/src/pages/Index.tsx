import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import MovieCard from '@/components/MovieCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const featuredMovies = [
    {
      title: 'Cosmic Odyssey',
      image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80',
      rating: 4.8,
      genre: 'Sci-Fi'
    },
    {
      title: 'Shadow Hunter',
      image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80',
      rating: 4.6,
      genre: 'Action'
    },
    {
      title: 'Eternal Love',
      image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80',
      rating: 4.7,
      genre: 'Romance'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-32 px-4 overflow-hidden">
        {/* Background with movie collage effect */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&q=80')] bg-cover bg-center opacity-20 blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        
        <div className="container mx-auto text-center relative z-10 animate-fade-in">
          {/* Glassmorphism card */}
          <div className="glass-card max-w-4xl mx-auto p-12 border-2 border-primary/20">
            {isAuthenticated && (
              <p className="text-sm text-muted-foreground mb-3">Hi, <span className="text-primary font-semibold">{user?.name}</span></p>
            )}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-slide-up">
              🎬 Welcome to CineVerse
            </h1>
            <p className="text-2xl text-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Your Gateway to Theatres, Movies, and Memorable Screen Experiences.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <Button
                size="lg"
                onClick={() => navigate('/shows')}
                className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 glow-primary group transition-all duration-300"
              >
                🎟️ View Shows
                <Sparkles className="ml-2 h-5 w-5 group-hover:animate-spin" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/movies')}
                className="text-lg px-8 py-6 border-2 border-primary/50 hover:border-primary hover:bg-primary/10 group transition-all duration-300"
              >
                🎬 Explore Movies
              </Button>
            </div>


          </div>
        </div>
      </section>

      {/* Featured Movies Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Now Showing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {featuredMovies.map((movie, index) => (
              <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <MovieCard {...movie} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why CineVerse Section */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Why Choose CineVerse?
            </h2>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              CineVerse is a <span className="text-primary font-semibold">Database-Driven Theatre Management Platform</span> built to streamline theatre operations, ticket bookings, and audience engagement.
            </p>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto mt-4 leading-relaxed">
              Powered by <span className="text-accent font-semibold">Flask and MySQL</span>, it ensures real-time data synchronization, efficient seat management, and analytics for theatre administrators.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { 
                icon: '🎞️', 
                title: 'Real-Time Booking', 
                desc: 'Instant seat availability updates and booking confirmations with synchronized database transactions' 
              },
              { 
                icon: '💼', 
                title: 'Admin Dashboard', 
                desc: 'Complete theatre management with movie scheduling, pricing control, and booking oversight' 
              },
              { 
                icon: '📊', 
                title: 'Theatre Revenue Analytics', 
                desc: 'Comprehensive insights into revenue trends, top movies, and occupancy rates for data-driven decisions' 
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="glass-card p-8 text-center hover:shadow-xl hover:shadow-primary/20 hover:scale-105 transition-all duration-300 border border-primary/20 hover:border-primary/50 group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-primary group-hover:text-accent transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;

