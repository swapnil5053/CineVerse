import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, IndianRupee, Ticket, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { api, Booking } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const MyBookings = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('MyBookings useEffect - isAuthenticated:', isAuthenticated, 'user:', user);
    
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      navigate('/login');
      return;
    }
    
    if (!user) {
      console.log('No user data yet, waiting...');
      return;
    }
    
    // Add a small delay to ensure authentication is fully established
    const timer = setTimeout(() => {
      loadBookings();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, user, navigate]);

  const loadBookings = async () => {
    try {
      console.log('Loading bookings for user:', user);
      const data = await api.getMyBookings();
      console.log('Bookings API response:', data);
      setBookings(data.bookings || []);
    } catch (error: any) {
      console.error('Bookings error:', error);
      if (error.message?.includes('Authentication') || error.message?.includes('401')) {
        toast.error('Please log in again to view your bookings');
        navigate('/login');
      } else {
        toast.error(error.message || 'Failed to load bookings');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: number) => {
    try {
      await api.cancelBooking(bookingId);
      toast.success('Booking cancelled successfully!');
      loadBookings(); // Refresh the bookings list
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel booking');
    }
  };

  const activeBookings = (bookings || []).filter(b => b && b.status === 'confirmed');
  const pastBookings = (bookings || []).filter(b => b && b.status !== 'confirmed');

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your bookings...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <Ticket className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">My Bookings</h1>
          </div>

          {/* Active Bookings */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-primary">Active Bookings</h2>
            {activeBookings.length > 0 ? (
              <div className="grid gap-4">
                {activeBookings.map((booking) => (
                  <Card key={booking.booking_id} className="glass-card hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-start justify-between">
                            <h3 className="text-xl font-bold text-primary">{booking.movie_title}</h3>
                            <Badge className="bg-primary/10 text-primary border-primary/30">
                              {booking.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4 text-accent" />
                              <span>{booking.theatre_name} - {booking.screen_name}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4 text-accent" />
                              <span>{booking.show_date}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-4 w-4 text-accent" />
                              <span>{booking.show_time}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Ticket className="h-4 w-4 text-accent" />
                              <span>{booking.seats_booked} Seats</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t border-border/50">
                            <div className="flex items-center gap-1 font-semibold text-lg">
                              <IndianRupee className="h-5 w-5 text-primary" />
                              <span>{booking.total_amount}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Booked: {new Date(booking.booking_time).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex md:flex-col gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancel(booking.booking_id)}
                            className="gap-2"
                          >
                            <X className="h-4 w-4" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="glass-card p-8 text-center">
                <p className="text-muted-foreground">No active bookings</p>
              </Card>
            )}
          </div>

          {/* Past Bookings */}
          {pastBookings.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-muted-foreground">Past Bookings</h2>
              <div className="grid gap-4">
                {pastBookings.map((booking) => (
                  <Card key={booking.booking_id} className="glass-card opacity-60">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-start justify-between">
                            <h3 className="text-xl font-bold">{booking.movie_title}</h3>
                            <Badge variant="secondary" className="bg-muted">
                              {booking.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{booking.theatre_name} - {booking.screen_name}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{booking.show_date}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <IndianRupee className="h-4 w-4" />
                              <span>{booking.total_amount}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MyBookings;
