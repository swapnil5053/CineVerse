import { useState, useEffect } from 'react';
import { Search, Calendar as CalendarIcon, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import ShowCard from '@/components/ShowCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { api, Show, Theatre } from '@/services/api';
import { toast } from 'sonner';

const Shows = () => {
  const navigate = useNavigate();
  const [movie, setMovie] = useState('');
  const [date, setDate] = useState<Date>();
  const [theatre, setTheatre] = useState('all');
  const [shows, setShows] = useState<Show[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load theatres for dropdown
    loadTheatres();
    // Load all shows initially
    loadAllShows();
  }, []);

  const loadAllShows = async () => {
    setLoading(true);
    setSearched(true);
    
    try {
      console.log('Loading all shows...');
      const data = await api.getShows({});
      console.log('Shows loaded:', data.shows?.length || 0);
      setShows(data.shows || []);
    } catch (error) {
      console.error('Failed to load shows:', error);
      toast.error('Failed to load shows. Please try again.');
      setShows([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTheatres = async () => {
    try {
      const data = await api.getTheatres();
      setTheatres(data.theatres || []);
    } catch (error) {
      console.error('Failed to load theatres:', error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    
    try {
      const filters = {
        movie: movie || undefined,
        theatre: (theatre && theatre !== 'all') ? theatre : undefined,
        date: date ? format(date, 'yyyy-MM-dd') : undefined
      };
      
      const data = await api.getShows(filters);
      setShows(data.shows || []);
    } catch (error) {
      console.error('Failed to fetch shows:', error);
      toast.error('Failed to load shows. Please try again.');
      setShows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setMovie('');
    setDate(undefined);
    setTheatre('all');
    loadAllShows();
  };

  const handleBookShow = (show: Show) => {
    navigate('/book', { state: { show } });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Search Section */}
        <div className="glass-card p-6 mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Search className="h-6 w-6 text-primary" />
            Find Your Show
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Movie Title */}
            <Input
              placeholder="Movie Title"
              value={movie}
              onChange={(e) => setMovie(e.target.value)}
              className="glass-button"
            />
            
            {/* Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal glass-button",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 glass-card" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            
            {/* Theatre Dropdown */}
            <Select value={theatre} onValueChange={setTheatre}>
              <SelectTrigger className="glass-button">
                <SelectValue placeholder="All Theatres" />
              </SelectTrigger>
              <SelectContent className="glass-card">
                <SelectItem value="all">All Theatres</SelectItem>
                {theatres.map((t) => (
                  <SelectItem key={t.theatre_id} value={t.name}>
                    {t.name} - {t.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="flex-1 bg-primary hover:bg-primary/90 glow-primary"
              >
                <Search className="mr-2 h-4 w-4" />
                {loading ? 'Loading...' : 'Filter'}
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                className="glass-button"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>



        {/* Results Section */}
        {searched && (
          <div className="animate-slide-up">
            {shows.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">
                    Found {shows.length} show{shows.length !== 1 ? 's' : ''}
                  </h3>
                  {(movie || date || (theatre && theatre !== 'all')) && (
                    <Button
                      onClick={handleClear}
                      variant="outline"
                      size="sm"
                      className="glass-button"
                    >
                      View All Shows
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {shows.map((show) => (
                    <ShowCard
                      key={show.show_id}
                      {...show}
                      onBook={() => handleBookShow(show)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="glass-card p-12 text-center">
                <div className="mb-4">
                  <MapPin className="h-16 w-16 text-muted-foreground mx-auto opacity-50" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No shows found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters to find available shows
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Shows;
