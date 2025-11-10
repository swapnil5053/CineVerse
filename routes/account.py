from flask import Blueprint, render_template, session, redirect, url_for, flash
from db.connection import get_conn

account_bp = Blueprint('account', __name__, url_prefix='/')

@account_bp.get('my_bookings')
def my_bookings():
    user_id = session.get('user_id')
    if not user_id:
        flash('Please log in to view your bookings', 'warning')
        return redirect(url_for('auth.login_get'))

    sql = (
        "SELECT b.booking_id, b.booking_time, b.seats_booked, b.total_amount, b.status, "
        "m.title AS movie_title, t.name AS theatre_name, sc.name AS screen_name, s.show_date, s.show_time "
        "FROM booking b "
        "JOIN showtime s ON s.show_id = b.show_id "
        "JOIN screen sc ON sc.screen_id = s.screen_id "
        "JOIN theatre t ON t.theatre_id = sc.theatre_id "
        "JOIN movie m ON m.movie_id = s.movie_id "
        "WHERE b.cust_id = %s ORDER BY b.booking_time DESC"
    )
    with get_conn() as conn:
        with conn.cursor(dictionary=True) as cur:
            cur.execute(sql, (user_id,))
            rows = cur.fetchall()

    return render_template('my_bookings.html', items=rows)
