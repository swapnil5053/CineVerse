from datetime import datetime, timedelta
from flask import Blueprint, render_template, jsonify, request, session, redirect, url_for, flash
from db.connection import get_conn

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

@admin_bp.before_request
def _admin_guard():
    role = session.get('role')
    if role != 'admin':
        flash('Access denied! Admins only.', 'danger')
        return redirect(url_for('shows.list_shows'))

@admin_bp.get('/dashboard')
def dashboard():
    # High-level KPIs
    today = datetime.utcnow()
    start_30 = today - timedelta(days=30)

    total_revenue_30 = 0.0
    bookings_count_30 = 0
    with get_conn() as conn:
        with conn.cursor() as cur:
            # Use stored procedure for revenue
            args = [start_30, today, 0]
            res = cur.callproc('sp_get_total_revenue', args)
            total_revenue_30 = float(res[2]) if res[2] is not None else 0.0
            # Count confirmed bookings last 30 days
            cur.execute("SELECT COUNT(*) FROM booking WHERE status='confirmed' AND booking_time BETWEEN %s AND %s", (start_30, today))
            bookings_count_30 = cur.fetchone()[0]

    return render_template('admin_dashboard.html', kpis={
        'total_revenue_30': total_revenue_30,
        'bookings_count_30': bookings_count_30
    })

@admin_bp.get('/charts/revenue_by_theatre')
def chart_revenue_by_theatre():
    labels = []
    data = []
    with get_conn() as conn:
        with conn.cursor(dictionary=True) as cur:
            cur.execute("SELECT theatre_name, total_revenue FROM v_theatre_revenue ORDER BY total_revenue DESC")
            rows = cur.fetchall()
            for r in rows:
                labels.append(r['theatre_name'])
                data.append(float(r['total_revenue'] or 0))
    return jsonify({'labels': labels, 'data': data})

@admin_bp.get('/charts/top_movies')
def chart_top_movies():
    labels = []
    data = []
    with get_conn() as conn:
        with conn.cursor(dictionary=True) as cur:
            cur.execute(
                "SELECT m.title AS movie, IFNULL(SUM(b.total_amount),0) AS rev "
                "FROM booking b JOIN showtime s ON b.show_id=s.show_id JOIN movie m ON s.movie_id=m.movie_id "
                "WHERE b.status='confirmed' GROUP BY m.movie_id ORDER BY rev DESC LIMIT 5"
            )
            for r in cur.fetchall():
                labels.append(r['movie'])
                data.append(float(r['rev'] or 0))
    return jsonify({'labels': labels, 'data': data})

@admin_bp.get('/charts/occupancy')
def chart_occupancy():
    # average occupancy for upcoming shows: (capacity - available)/capacity
    labels = []
    data = []
    with get_conn() as conn:
        with conn.cursor(dictionary=True) as cur:
            cur.execute(
                "SELECT s.show_id, m.title AS movie, sc.capacity, s.available_seats "
                "FROM showtime s JOIN screen sc ON s.screen_id=sc.screen_id JOIN movie m ON s.movie_id=m.movie_id "
                "WHERE s.show_date >= CURDATE() LIMIT 10"
            )
            for r in cur.fetchall():
                cap = r['capacity']
                occ = 0.0
                if cap and cap > 0:
                    occ = (cap - (r['available_seats'] or 0)) / cap
                labels.append(r['movie'])
                data.append(round(occ * 100, 2))
    return jsonify({'labels': labels, 'data': data})
