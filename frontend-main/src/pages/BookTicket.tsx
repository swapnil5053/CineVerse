import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, IndianRupee, CreditCard, Smartphone, Wallet, CheckCircle2, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { api, Show } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import SeatMap from '@/components/SeatMap';

const BookTicket = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const show: Show = location.state?.show;
  
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(true);

  // Load booked seats when component mounts
  useEffect(() => {
    const loadBookedSeats = async () => {
      if (!show) return;
      
      try {
        setLoadingSeats(true);
        const data = await api.getBookedSeats(show.show_id);
        setBookedSeats(data.booked_seats || []);
      } catch (error) {
        console.error('Failed to load booked seats:', error);
        toast.error('Failed to load seat availability');
      } finally {
        setLoadingSeats(false);
      }
    };

    loadBookedSeats();
  }, [show]);

  if (!show) {
    navigate('/shows');
    return null;
  }

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Calculate total amount based on seat types
  const calculateTotalAmount = () => {
    let total = 0;
    selectedSeats.forEach(seatId => {
      const row = seatId[0];
      const rowIndex = row.charCodeAt(0) - 'A'.charCodeAt(0);
      
      if (rowIndex < 3) { // Standard seats (rows A, B, C)
        total += show.base_price;
      } else if (rowIndex < 7) { // Premium seats (rows D, E, F, G)
        total += show.base_price + 100;
      } else { // VIP seats (rows H, I, J+)
        total += show.base_price + 200;
      }
    });
    return total;
  };

  const totalAmount = calculateTotalAmount();

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }

    setLoading(true);
    
    try {
      const result = await api.bookTicket(show.show_id, selectedSeats, paymentMethod);
      setShowSuccess(true);
      toast.success(result.message || 'Booking confirmed!');
    } catch (error: any) {
      toast.error(error.message || 'Booking failed. Please try again.');
      // Refresh booked seats in case some were booked by others
      try {
        const data = await api.getBookedSeats(show.show_id);
        setBookedSeats(data.booked_seats || []);
      } catch (refreshError) {
        console.error('Failed to refresh booked seats:', refreshError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate('/my-bookings');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          {/* Show Summary */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{show.movie_title}</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="bg-primary/20 px-2 py-1 rounded text-primary">{show.genre}</span>
                    <span className="bg-accent/20 px-2 py-1 rounded text-accent">{show.language}</span>
                    {show.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm">{show.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-accent" />
                    <span>{show.theatre_name}, {show.city}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 text-accent" />
                    <span>{show.show_date}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 text-accent" />
                    <span>{show.screen_name} ({show.screen_type}) - {show.show_time}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 font-semibold">
                    <IndianRupee className="h-4 w-4 text-primary" />
                    <span>From ₹{show.base_price} ({show.price_type})</span>
                  </div>
                </div>
                
                {/* Seat Pricing Info */}
                <div className="bg-muted/20 p-3 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Seat Pricing:</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded border bg-green-500/10 border-green-500/30"></div>
                      <span>Standard: ₹{show.base_price}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded border bg-blue-500/10 border-blue-500/30"></div>
                      <span>Premium: ₹{show.base_price + 100}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded border bg-purple-500/10 border-purple-500/30"></div>
                      <span>VIP: ₹{show.base_price + 200}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Form */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Seat Selection */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Select Your Seats</Label>
                {loadingSeats ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <SeatMap
                    totalSeats={Math.max(120, show.available_seats + bookedSeats.length)} // Show realistic total seats
                    bookedSeats={bookedSeats}
                    onSeatSelect={setSelectedSeats}
                    maxSeats={10}
                  />
                )}
              </div>

              {/* Payment Method */}
              <div className="space-y-3">
                <Label>Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 glass-button p-4 rounded-lg cursor-pointer hover:bg-primary/5">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Smartphone className="h-5 w-5 text-primary" />
                      UPI Payment
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 glass-button p-4 rounded-lg cursor-pointer hover:bg-primary/5">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Credit/Debit Card
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 glass-button p-4 rounded-lg cursor-pointer hover:bg-primary/5">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Wallet className="h-5 w-5 text-primary" />
                      Cash at Counter
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Total Amount */}
              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount</span>
                  <div className="flex items-center gap-1 text-primary">
                    <IndianRupee className="h-5 w-5" />
                    <span>{totalAmount}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleBooking}
                disabled={loading || selectedSeats.length === 0 || selectedSeats.length > show.available_seats}
                className="w-full bg-primary hover:bg-primary/90 glow-primary py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : selectedSeats.length === 0 ? 'Select Seats to Continue' : 'Confirm Booking'}
              </Button>
              
              {selectedSeats.length > show.available_seats && (
                <p className="text-red-500 text-sm text-center">
                  Only {show.available_seats} seats available
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full glow-primary">
                <CheckCircle2 className="h-12 w-12 text-primary" />
              </div>
            </div>
            <DialogTitle className="text-2xl text-center">Booking Confirmed!</DialogTitle>
            <DialogDescription className="text-center space-y-2">
              <p>Your tickets have been booked successfully.</p>
              <p className="font-semibold text-primary">
                Seats: {selectedSeats.join(', ')} • ₹{totalAmount}
              </p>
            </DialogDescription>
          </DialogHeader>
          <Button onClick={handleSuccessClose} className="w-full bg-primary hover:bg-primary/90">
            View My Bookings
          </Button>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default BookTicket;
