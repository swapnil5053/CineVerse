from flask import Blueprint, jsonify, request, session
from db.connection import get_conn
from datetime import datetime

api_bp = Blueprint('api', __name__, url_prefix='/api')

@api_bp.route('/shows', methods=['GET'])
def get_shows():
    """Get all shows with filters"""
    movie = request.args.get('movie', '').strip()
    date = request.args.get('date', '').strip()
    theatre = request.args.get('theatre', '').strip()
    page = int(request.args.get('page', 1))
    per_page = 12
    
    # Build query
    query = """
        SELECT s.show_id, m.title as movie_title, m.genre, m.language, m.rating,
               t.name as theatre_name, t.city, sc.name as screen_name, sc.type as screen_type,
               s.show_date, s.show_time, s.price_type, s.base_price, s.available_seats
        FROM showtime s
        JOIN movie m ON s.movie_id = m.movie_id
        JOIN screen sc ON s.screen_id = sc.screen_id
        JOIN theatre t ON sc.theatre_id = t.theatre_id
        WHERE s.show_date >= CURDATE()
    """
    
    params = []
    if movie:
        query += " AND m.title LIKE %s"
        params.append(f"%{movie}%")
    if date:
        query += " AND s.show_date = %s"
        params.append(date)
    if theatre:
        query += " AND t.name LIKE %s"
        params.append(f"%{theatre}%")
    
    query += " ORDER BY s.show_date, s.show_time"
    
    with get_conn() as conn:
        with conn.cursor(dictionary=True) as cur:
            # Get total count first
            count_query = """
                SELECT COUNT(*) as total
                FROM showtime s
                JOIN movie m ON s.movie_id = m.movie_id
                JOIN screen sc ON s.screen_id = sc.screen_id
                JOIN theatre t ON sc.theatre_id = t.theatre_id
                WHERE s.show_date >= CURDATE()
            """
            count_params = []
            if movie:
                count_query += " AND m.title LIKE %s"
                count_params.append(f"%{movie}%")
            if date:
                count_query += " AND s.show_date = %s"
                count_params.append(date)
            if theatre:
                count_query += " AND t.name LIKE %s"
                count_params.append(f"%{theatre}%")
            
            cur.execute(count_query, count_params)
            total = cur.fetchone()['total']
            
            # Get paginated results
            query += " LIMIT %s OFFSET %s"
            params.extend([per_page, (page - 1) * per_page])
            cur.execute(query, params)
            shows = cur.fetchall()
            
            # Convert datetime objects to strings
            for show in shows:
                if show['show_date']:
                    show['show_date'] = show['show_date'].strftime('%Y-%m-%d')
                if show['show_time']:
                    show['show_time'] = str(show['show_time'])
                if show['base_price']:
                    show['base_price'] = float(show['base_price'])
    
    return jsonify({
        'shows': shows,
        'total': total,
        'page': page,
        'per_page': per_page,
        'pages': (total + per_page - 1) // per_page
    })

@api_bp.route('/movies', methods=['GET'])
def get_movies():
    """Get all movies"""
    with get_conn() as conn:
        with conn.cursor(dictionary=True) as cur:
            cur.execute("SELECT * FROM movie WHERE status = 'now_showing' ORDER BY title")
            movies = cur.fetchall()
            
            for movie in movies:
                if movie['release_date']:
                    movie['release_date'] = movie['release_date'].strftime('%Y-%m-%d')
                if movie['rating']:
                    movie['rating'] = float(movie['rating'])
    
    return jsonify({'movies': movies})

@api_bp.route('/theatres', methods=['GET'])
def get_theatres():
    """Get all theatres"""
    with get_conn() as conn:
        with conn.cursor(dictionary=True) as cur:
            cur.execute("SELECT * FROM theatre ORDER BY city, name")
            theatres = cur.fetchall()
    
    return jsonify({'theatres': theatres})

@api_bp.route('/book', methods=['POST'])
def book_ticket():
    """Book a ticket with specific seats"""
    print(f"Booking session data: {dict(session)}")  # Debug log
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    show_id = data.get('show_id')
    selected_seats = data.get('selected_seats', [])  # Array of seat IDs like ['A1', 'A2']
    payment_method = data.get('payment_method', 'upi')
    
    print(f"Booking request: show_id={show_id}, seats={selected_seats}, payment={payment_method}")
    
    if not show_id:
        return jsonify({'error': 'Show ID required'}), 400
    
    if not selected_seats or len(selected_seats) == 0:
        return jsonify({'error': 'Please select at least one seat'}), 400
    
    try:
        with get_conn() as conn:
            with conn.cursor(dictionary=True) as cur:
                # Check if any of the selected seats are already booked
                seat_placeholders = ','.join(['%s'] * len(selected_seats))
                cur.execute(f"""
                    SELECT seat_id FROM seat_booking 
                    WHERE show_id = %s AND seat_id IN ({seat_placeholders}) AND status = 'booked'
                """, [show_id] + selected_seats)
                
                already_booked = cur.fetchall()
                if already_booked:
                    booked_seats = [seat['seat_id'] for seat in already_booked]
                    return jsonify({
                        'error': f'Seats {", ".join(booked_seats)} are already booked. Please select different seats.'
                    }), 400
                
                # Check show availability
                cur.execute("SELECT available_seats, base_price FROM showtime WHERE show_id = %s", (show_id,))
                show_info = cur.fetchone()
                
                if not show_info:
                    return jsonify({'error': 'Show not found'}), 404
                
                if show_info['available_seats'] < len(selected_seats):
                    return jsonify({'error': 'Not enough seats available'}), 400
                
                # Calculate total amount based on seat types
                base_price = show_info['base_price']
                total_amount = 0
                
                for seat_id in selected_seats:
                    # Determine seat type based on row
                    row = seat_id[0]  # First character is the row (A, B, C, etc.)
                    row_index = ord(row) - ord('A')  # Convert A=0, B=1, C=2, etc.
                    
                    if row_index < 3:  # Standard seats (rows A, B, C)
                        seat_price = base_price
                    elif row_index < 7:  # Premium seats (rows D, E, F, G)
                        seat_price = base_price + 100
                    else:  # VIP seats (rows H, I, J+)
                        seat_price = base_price + 200
                    
                    total_amount += seat_price
                
                # Create booking record
                cur.execute("""
                    INSERT INTO booking (cust_id, show_id, seats_booked, total_amount, payment_method, status)
                    VALUES (%s, %s, %s, %s, %s, 'confirmed')
                """, (session['user_id'], show_id, len(selected_seats), total_amount, payment_method))
                
                booking_id = cur.lastrowid
                
                # Insert individual seat bookings
                for seat_id in selected_seats:
                    cur.execute("""
                        INSERT INTO seat_booking (booking_id, show_id, seat_id, status)
                        VALUES (%s, %s, %s, 'booked')
                    """, (booking_id, show_id, seat_id))
                
                # Update available seats
                cur.execute("""
                    UPDATE showtime SET available_seats = available_seats - %s
                    WHERE show_id = %s
                """, (len(selected_seats), show_id))
                
                conn.commit()
                
                return jsonify({
                    'success': True,
                    'booking_id': booking_id,
                    'message': f'Seats {", ".join(selected_seats)} booked successfully!',
                    'booked_seats': selected_seats
                })
                    
    except Exception as e:
        print(f"Booking error: {str(e)}")
        return jsonify({'error': f'Booking failed: {str(e)}'}), 500

@api_bp.route('/auth/login', methods=['POST'])
def api_login():
    """API login endpoint"""
    from passlib.hash import pbkdf2_sha256 as bcrypt
    
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not (email and password):
        return jsonify({'error': 'Email and password required'}), 400
    
    with get_conn() as conn:
        with conn.cursor(dictionary=True) as cur:
            cur.execute("SELECT cust_id, name, email, role, password_hash FROM customer WHERE email=%s", (email,))
            user = cur.fetchone()
    
    if not user or not bcrypt.verify(password, user['password_hash']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    session['user_id'] = user['cust_id']
    session['user_name'] = user['name']
    session['role'] = user.get('role', 'customer')
    
    return jsonify({
        'success': True,
        'user': {
            'id': user['cust_id'],
            'name': user['name'],
            'email': user['email'],
            'role': user.get('role', 'customer')
        }
    })

@api_bp.route('/auth/register', methods=['POST'])
def api_register():
    """API registration endpoint"""
    from passlib.hash import pbkdf2_sha256 as bcrypt
    
    data = request.get_json()
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    contact_no = data.get('contact_no', '').strip()
    password = data.get('password', '')
    
    if not (name and email and password):
        return jsonify({'error': 'Name, email, and password are required'}), 400
    
    try:
        password_hash = bcrypt.hash(password)
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO customer (name, email, contact_no, membership_status, password_hash) VALUES (%s,%s,%s,'none',%s)",
                    (name, email, contact_no, password_hash)
                )
                conn.commit()
        
        return jsonify({'success': True, 'message': 'Registration successful'})
    except Exception:
        return jsonify({'error': 'Registration failed. Email may already be in use.'}), 400

@api_bp.route('/auth/logout', methods=['POST'])
def api_logout():
    """API logout endpoint"""
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully'})

@api_bp.route('/auth/me', methods=['GET'])
def get_current_user():
    """Get current user info"""
    print(f"Session data: {dict(session)}")  # Debug log
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    return jsonify({
        'user': {
            'id': session['user_id'],
            'name': session['user_name'],
            'role': session.get('role', 'customer')
        }
    })

@api_bp.route('/my-bookings', methods=['GET'])
def get_my_bookings():
    """Get current user's bookings"""
    print(f"My bookings session data: {dict(session)}")  # Debug log
    if 'user_id' not in session:
        print("No user_id in session, returning 401")
        return jsonify({'error': 'Authentication required'}), 401
    
    with get_conn() as conn:
        with conn.cursor(dictionary=True) as cur:
            cur.execute("""
                SELECT b.booking_id, b.show_id, b.seats_booked, b.total_amount, 
                       b.booking_time, b.status,
                       m.title as movie_title, t.name as theatre_name, 
                       sc.name as screen_name, s.show_date, s.show_time
                FROM booking b
                JOIN showtime s ON b.show_id = s.show_id
                JOIN movie m ON s.movie_id = m.movie_id
                JOIN screen sc ON s.screen_id = sc.screen_id
                JOIN theatre t ON sc.theatre_id = t.theatre_id
                WHERE b.cust_id = %s
                ORDER BY b.booking_time DESC
            """, (session['user_id'],))
            bookings = cur.fetchall()
            
            # Convert datetime objects to strings
            for booking in bookings:
                if booking['booking_time']:
                    booking['booking_time'] = booking['booking_time'].strftime('%Y-%m-%d %H:%M:%S')
                if booking['show_date']:
                    booking['show_date'] = booking['show_date'].strftime('%Y-%m-%d')
                if booking['show_time']:
                    booking['show_time'] = str(booking['show_time'])
                if booking['total_amount']:
                    booking['total_amount'] = float(booking['total_amount'])
    
    return jsonify({'bookings': bookings})

@api_bp.route('/admin/reset-seats', methods=['POST'])
def reset_seat_availability():
    """Reset seat availability for shows with zero seats (Admin only)"""
    if 'user_id' not in session or session.get('role') != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                # Reset seat availability to screen capacity for shows with 0 seats
                cur.execute("""
                    UPDATE showtime s 
                    JOIN screen sc ON s.screen_id = sc.screen_id 
                    SET s.available_seats = sc.capacity 
                    WHERE s.available_seats <= 0
                """)
                
                conn.commit()
                updated_count = cur.rowcount
                
                return jsonify({
                    'success': True,
                    'message': f'Reset seat availability for {updated_count} shows'
                })
                
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/cancel-booking/<int:booking_id>', methods=['POST'])
def cancel_booking(booking_id):
    """Cancel a booking"""
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        with get_conn() as conn:
            with conn.cursor(dictionary=True) as cur:
                # Check if booking exists and belongs to user
                cur.execute("""
                    SELECT booking_id, cust_id, status, show_id, seats_booked
                    FROM booking 
                    WHERE booking_id = %s AND cust_id = %s
                """, (booking_id, session['user_id']))
                
                booking = cur.fetchone()
                if not booking:
                    return jsonify({'error': 'Booking not found'}), 404
                
                if booking['status'] != 'confirmed':
                    return jsonify({'error': 'Booking cannot be cancelled'}), 400
                
                # Update booking status to cancelled
                cur.execute("""
                    UPDATE booking 
                    SET status = 'cancelled' 
                    WHERE booking_id = %s
                """, (booking_id,))
                
                conn.commit()
                
                return jsonify({
                    'success': True,
                    'message': 'Booking cancelled successfully'
                })
                
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/admin/bookings', methods=['GET'])
def get_all_bookings():
    """Get all bookings for admin"""
    if 'user_id' not in session or session.get('role') != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    with get_conn() as conn:
        with conn.cursor(dictionary=True) as cur:
            cur.execute("""
                SELECT b.booking_id, b.show_id, b.seats_booked, b.total_amount, 
                       b.booking_time, b.status,
                       c.name as customer_name, c.email as customer_email,
                       m.title as movie_title, t.name as theatre_name, 
                       sc.name as screen_name, s.show_date, s.show_time
                FROM booking b
                JOIN customer c ON b.cust_id = c.cust_id
                JOIN showtime s ON b.show_id = s.show_id
                JOIN movie m ON s.movie_id = m.movie_id
                JOIN screen sc ON s.screen_id = sc.screen_id
                JOIN theatre t ON sc.theatre_id = t.theatre_id
                ORDER BY b.booking_time DESC
                LIMIT 100
            """)
            bookings = cur.fetchall()
            
            # Convert datetime objects to strings
            for booking in bookings:
                if booking['booking_time']:
                    booking['booking_time'] = booking['booking_time'].strftime('%Y-%m-%d %H:%M:%S')
                if booking['show_date']:
                    booking['show_date'] = booking['show_date'].strftime('%Y-%m-%d')
                if booking['show_time']:
                    booking['show_time'] = str(booking['show_time'])
                if booking['total_amount']:
                    booking['total_amount'] = float(booking['total_amount'])
    
    return jsonify({'bookings': bookings})

@api_bp.route('/admin/stats', methods=['GET'])
def get_admin_stats():
    """Get admin dashboard statistics"""
    if 'user_id' not in session or session.get('role') != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    with get_conn() as conn:
        with conn.cursor(dictionary=True) as cur:
            # Total bookings today
            cur.execute("""
                SELECT COUNT(*) as count, IFNULL(SUM(total_amount), 0) as revenue
                FROM booking 
                WHERE DATE(booking_time) = CURDATE() AND status = 'confirmed'
            """)
            today_stats = cur.fetchone()
            
            # Total bookings this month
            cur.execute("""
                SELECT COUNT(*) as count, IFNULL(SUM(total_amount), 0) as revenue
                FROM booking 
                WHERE MONTH(booking_time) = MONTH(CURDATE()) 
                AND YEAR(booking_time) = YEAR(CURDATE()) 
                AND status = 'confirmed'
            """)
            month_stats = cur.fetchone()
            
            # Top movies by bookings
            cur.execute("""
                SELECT m.title, COUNT(b.booking_id) as bookings, SUM(b.total_amount) as revenue
                FROM booking b
                JOIN showtime s ON b.show_id = s.show_id
                JOIN movie m ON s.movie_id = m.movie_id
                WHERE b.status = 'confirmed'
                GROUP BY m.movie_id
                ORDER BY bookings DESC
                LIMIT 5
            """)
            top_movies = cur.fetchall()
            
            # Recent bookings
            cur.execute("""
                SELECT b.booking_id, b.seats_booked, b.total_amount, b.booking_time,
                       c.name as customer_name, m.title as movie_title, t.name as theatre_name
                FROM booking b
                JOIN customer c ON b.cust_id = c.cust_id
                JOIN showtime s ON b.show_id = s.show_id
                JOIN movie m ON s.movie_id = m.movie_id
                JOIN screen sc ON s.screen_id = sc.screen_id
                JOIN theatre t ON sc.theatre_id = t.theatre_id
                WHERE b.status = 'confirmed'
                ORDER BY b.booking_time DESC
                LIMIT 10
            """)
            recent_bookings = cur.fetchall()
            
            # Convert datetime objects
            for booking in recent_bookings:
                if booking['booking_time']:
                    booking['booking_time'] = booking['booking_time'].strftime('%Y-%m-%d %H:%M:%S')
                if booking['total_amount']:
                    booking['total_amount'] = float(booking['total_amount'])
            
            for movie in top_movies:
                if movie['revenue']:
                    movie['revenue'] = float(movie['revenue'])
    
    return jsonify({
        'today': {
            'bookings': today_stats['count'],
            'revenue': float(today_stats['revenue'])
        },
        'month': {
            'bookings': month_stats['count'],
            'revenue': float(month_stats['revenue'])
        },
        'top_movies': top_movies,
        'recent_bookings': recent_bookings
    })

@api_bp.route('/screens', methods=['GET'])
def get_screens():
    """Get all screens with theatre information"""
    with get_conn() as conn:
        with conn.cursor(dictionary=True) as cur:
            cur.execute("""
                SELECT sc.screen_id, sc.name AS screen_name, sc.type, sc.capacity,
                       t.theatre_id, t.name AS theatre_name, t.city
                FROM screen sc 
                JOIN theatre t ON t.theatre_id = sc.theatre_id 
                WHERE sc.status = 'active'
                ORDER BY t.city, t.name, sc.name
            """)
            screens = cur.fetchall()
    
    return jsonify({'screens': screens})

@api_bp.route('/show/<int:show_id>/booked-seats', methods=['GET'])
def get_booked_seats(show_id):
    """Get booked seats for a specific show"""
    with get_conn() as conn:
        with conn.cursor(dictionary=True) as cur:
            cur.execute("""
                SELECT seat_id FROM seat_booking 
                WHERE show_id = %s AND status = 'booked'
                ORDER BY seat_id
            """, (show_id,))
            booked_seats = cur.fetchall()
    
    return jsonify({
        'booked_seats': [seat['seat_id'] for seat in booked_seats]
    })

@api_bp.route('/admin/add-show', methods=['POST'])
def add_show():
    """Add a new show (Admin only)"""
    if 'user_id' not in session or session.get('role') != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    data = request.get_json()
    screen_id = data.get('screen_id')
    movie_id = data.get('movie_id')
    show_date = data.get('show_date')
    show_time = data.get('show_time')
    price_type = data.get('price_type', 'standard')
    base_price = data.get('base_price')
    
    if not all([screen_id, movie_id, show_date, show_time, base_price]):
        return jsonify({'error': 'All fields are required'}), 400
    
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                # First get the screen capacity
                cur.execute("SELECT capacity FROM screen WHERE screen_id = %s", (screen_id,))
                screen_result = cur.fetchone()
                
                if not screen_result:
                    return jsonify({'error': 'Invalid screen selected'}), 400
                
                capacity = screen_result[0]
                
                # Insert new show with correct available_seats (bypassing trigger issue)
                cur.execute("""
                    INSERT INTO showtime (screen_id, movie_id, show_date, show_time, price_type, base_price, available_seats)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (screen_id, movie_id, show_date, show_time, price_type, base_price, capacity))
                
                conn.commit()
                
                return jsonify({
                    'success': True,
                    'message': 'Show added successfully!'
                })
                
    except Exception as e:
        return jsonify({'error': f'Failed to add show: {str(e)}'}), 500