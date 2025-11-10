import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Ticket, Film, Building2, Plus, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAddShow, setShowAddShow] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState<any[]>([]);
  const [screens, setScreens] = useState<any[]>([]);
  const [showForm, setShowForm] = useState({
    screen_id: '',
    movie_id: '',
    show_date: '',
    show_time: '',
    price_type: 'standard',
    base_price: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    
    loadAdminData();
  }, [user, navigate]);

  const loadAdminData = async () => {
    try {
      const [statsData, moviesData, screensData] = await Promise.all([
        api.getAdminStats(),
        api.getMovies(),
        api.getScreens()
      ]);
      
      setStats(statsData);
      setRecentBookings(statsData.recent_bookings || []);
      setMovies(moviesData.movies || []);
      setScreens(screensData.screens || []);
    } catch (error: any) {
      toast.error('Failed to load admin data');
      console.error('Admin data error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading admin dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Failed to load admin data</p>
            <Button onClick={loadAdminData} className="mt-4">Retry</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const statCards = [
    { title: 'Revenue Today', value: `₹${stats.today.revenue.toLocaleString()}`, icon: TrendingUp, color: 'text-primary' },
    { title: 'Bookings Today', value: stats.today.bookings.toString(), icon: Ticket, color: 'text-accent' },
    { title: 'Revenue This Month', value: `₹${stats.month.revenue.toLocaleString()}`, icon: TrendingUp, color: 'text-primary' },
    { title: 'Bookings This Month', value: stats.month.bookings.toString(), icon: Users, color: 'text-accent' }
  ];

  const handleAddShow = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!showForm.screen_id || !showForm.movie_id || !showForm.show_date || !showForm.show_time || !showForm.base_price) {
      toast.error('All fields are required');
      return;
    }

    try {
      await api.addShow({
        screen_id: parseInt(showForm.screen_id),
        movie_id: parseInt(showForm.movie_id),
        show_date: showForm.show_date,
        show_time: showForm.show_time,
        price_type: showForm.price_type,
        base_price: parseFloat(showForm.base_price)
      });
      
      toast.success('Show added successfully!');
      setShowAddShow(false);
      setShowForm({
        screen_id: '',
        movie_id: '',
        show_date: '',
        show_time: '',
        price_type: 'standard',
        base_price: ''
      });
      
      // Refresh stats to show updated data
      loadAdminData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add show');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="space-y-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="flex gap-2">
              <Dialog open={showAddShow} onOpenChange={setShowAddShow}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 gap-2">
                    <Plus className="h-4 w-4" />
                    Add Show
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Show</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddShow} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Movie</Label>
                      <Select value={showForm.movie_id} onValueChange={(value) => setShowForm({...showForm, movie_id: value})}>
                        <SelectTrigger className="glass-button">
                          <SelectValue placeholder="Select movie" />
                        </SelectTrigger>
                        <SelectContent>
                          {movies.map((movie) => (
                            <SelectItem key={movie.movie_id} value={movie.movie_id.toString()}>
                              {movie.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Theatre & Screen</Label>
                      <Select value={showForm.screen_id} onValueChange={(value) => setShowForm({...showForm, screen_id: value})}>
                        <SelectTrigger className="glass-button">
                          <SelectValue placeholder="Select theatre & screen" />
                        </SelectTrigger>
                        <SelectContent>
                          {screens.map((screen) => (
                            <SelectItem key={screen.screen_id} value={screen.screen_id.toString()}>
                              {screen.theatre_name} - {screen.screen_name} ({screen.city})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input 
                        type="date" 
                        className="glass-button"
                        value={showForm.show_date}
                        onChange={(e) => setShowForm({...showForm, show_date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Input 
                        type="time" 
                        className="glass-button"
                        value={showForm.show_time}
                        onChange={(e) => setShowForm({...showForm, show_time: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price Type</Label>
                      <Select value={showForm.price_type} onValueChange={(value) => setShowForm({...showForm, price_type: value})}>
                        <SelectTrigger className="glass-button">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="vip">VIP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Base Price (₹)</Label>
                      <Input 
                        type="number" 
                        placeholder="250" 
                        className="glass-button"
                        value={showForm.base_price}
                        onChange={(e) => setShowForm({...showForm, base_price: e.target.value})}
                      />
                    </div>
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                      Add Show
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => (
              <Card key={index} className="glass-card hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`p-3 bg-primary/10 rounded-full ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Top Movies by Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.top_movies}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="title" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {recentBookings.map((booking, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{booking.customer_name}</p>
                        <p className="text-xs text-muted-foreground">{booking.movie_title} • {booking.theatre_name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(booking.booking_time).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">₹{booking.total_amount}</p>
                        <p className="text-xs text-muted-foreground">{booking.seats_booked} seat{booking.seats_booked !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  ))}
                  {recentBookings.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No recent bookings</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Top Movies by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.top_movies} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="title" type="category" stroke="hsl(var(--muted-foreground))" width={120} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--accent))" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
