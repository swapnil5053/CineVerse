const API_BASE_URL = 'http://localhost:5000/api';

export interface Show {
  show_id: number;
  movie_title: string;
  genre: string;
  language: string;
  rating: number;
  theatre_name: string;
  city: string;
  screen_name: string;
  screen_type: string;
  show_date: string;
  show_time: string;
  price_type: string;
  base_price: number;
  available_seats: number;
}

export interface Movie {
  movie_id: number;
  title: string;
  duration_minutes: number;
  genre: string;
  language: string;
  rating: number;
  release_date: string;
  status: string;
}

export interface Theatre {
  theatre_id: number;
  name: string;
  city: string;
  contact_no: string;
  address: string;
}

export interface Booking {
  booking_id: number;
  show_id: number;
  movie_title: string;
  theatre_name: string;
  screen_name: string;
  show_date: string;
  show_time: string;
  seats_booked: number;
  total_amount: number;
  booking_time: string;
  status: string;
}

export const api = {
  // Shows
  async getShows(filters: { movie?: string; date?: string; theatre?: string; page?: number }) {
    const params = new URLSearchParams();
    if (filters.movie) params.append('movie', filters.movie);
    if (filters.date) params.append('date', filters.date);
    if (filters.theatre) params.append('theatre', filters.theatre);
    if (filters.page) params.append('page', filters.page.toString());

    const response = await fetch(`${API_BASE_URL}/shows?${params}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch shows');
    }
    
    return response.json();
  },

  // Movies
  async getMovies() {
    const response = await fetch(`${API_BASE_URL}/movies`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch movies');
    }
    
    return response.json();
  },

  // Theatres
  async getTheatres() {
    const response = await fetch(`${API_BASE_URL}/theatres`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch theatres');
    }
    
    return response.json();
  },

  // Booking
  async bookTicket(showId: number, selectedSeats: string[], paymentMethod: string = 'upi') {
    const response = await fetch(`${API_BASE_URL}/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        show_id: showId,
        selected_seats: selectedSeats,
        payment_method: paymentMethod
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Booking failed');
    }
    
    return data;
  },

  // Get booked seats for a show
  async getBookedSeats(showId: number) {
    const response = await fetch(`${API_BASE_URL}/show/${showId}/booked-seats`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch booked seats');
    }
    
    return response.json();
  },

  // Get user bookings
  async getMyBookings() {
    const response = await fetch(`${API_BASE_URL}/my-bookings`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch bookings');
    }
    
    return response.json();
  },

  async cancelBooking(bookingId: number) {
    const response = await fetch(`${API_BASE_URL}/cancel-booking/${bookingId}`, {
      method: 'POST',
      credentials: 'include'
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to cancel booking');
    }
    
    return data;
  },

  // Admin endpoints
  async getAdminBookings() {
    const response = await fetch(`${API_BASE_URL}/admin/bookings`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch admin bookings');
    }
    
    return response.json();
  },

  async getAdminStats() {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch admin stats');
    }
    
    return response.json();
  },

  // Get screens with theatre info
  async getScreens() {
    const response = await fetch(`${API_BASE_URL}/screens`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch screens');
    }
    
    return response.json();
  },

  // Add show (Admin only)
  async addShow(showData: {
    screen_id: number;
    movie_id: number;
    show_date: string;
    show_time: string;
    price_type: string;
    base_price: number;
  }) {
    const response = await fetch(`${API_BASE_URL}/admin/add-show`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(showData)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to add show');
    }
    
    return data;
  }
};

export default api;