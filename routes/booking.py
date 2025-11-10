from flask import Blueprint, request, render_template, redirect, url_for, flash, session
from db.connection import get_conn
from utils.auth import login_required

booking_bp = Blueprint('booking', __name__)

@booking_bp.get('/book_ticket')
@login_required
def book_ticket_get():
    show_id = request.args.get('show_id', type=int)
    if not show_id:
        flash('Missing show_id', 'danger')
        return redirect(url_for('shows.list_shows'))

    # Fetch show details for confirmation
    sql = (
        "SELECT s.show_id, t.name AS theatre_name, sc.name AS screen_name, m.title AS movie_title, "
        "s.show_date, s.show_time, s.base_price, s.available_seats, sc.capacity "
        "FROM showtime s "
        "JOIN screen sc ON sc.screen_id = s.screen_id "
        "JOIN theatre t ON t.theatre_id = sc.theatre_id "
        "JOIN movie m ON m.movie_id = s.movie_id "
        "WHERE s.show_id = %s"
    )
    with get_conn() as conn:
        with conn.cursor(dictionary=True) as cur:
            cur.execute(sql, (show_id,))
            show = cur.fetchone()
    if not show:
        flash('Show not found', 'danger')
        return redirect(url_for('shows.list_shows'))

    return render_template('book_ticket.html', show=show)

@booking_bp.post('/book_ticket')
@login_required
def book_ticket_post():
    show_id = request.form.get('show_id', type=int)
    seats = request.form.get('seats', type=int)
    payment_method = request.form.get('payment_method')
    cust_id = session.get('user_id')

    if not all([show_id, seats, payment_method]):
        flash('All fields are required', 'danger')
        return redirect(url_for('booking.book_ticket_get', show_id=show_id or ''))

    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                args = [cust_id, show_id, seats, payment_method, 0, None]
                result = cur.callproc('sp_book_ticket', args)
                # result: [cust_id, show_id, seats, payment_method, p_booking_id, p_error]
                p_booking_id = result[4]
                p_error = result[5]
                if p_error:
                    conn.rollback()
                    flash(p_error, 'warning')
                    return redirect(url_for('booking.book_ticket_get', show_id=show_id))
                conn.commit()
                flash(f'Booking confirmed. ID: {p_booking_id}', 'success')
                return redirect(url_for('booking.booking_confirmation', booking_id=p_booking_id))
    except Exception as e:
        flash('Unexpected error while booking', 'danger')
        return redirect(url_for('booking.book_ticket_get', show_id=show_id))

@booking_bp.get('/booking/confirmation')
def booking_confirmation():
    booking_id = request.args.get('booking_id', type=int)
    if not booking_id:
        flash('Missing booking_id', 'danger')
        return redirect(url_for('shows.list_shows'))

    sql = (
        "SELECT b.booking_id, b.seats_booked, b.total_amount, b.payment_method, b.status, b.booking_time, "
        "m.title AS movie_title, t.name AS theatre_name, sc.name AS screen_name, s.show_date, s.show_time "
        "FROM booking b "
        "JOIN showtime s ON s.show_id = b.show_id "
        "JOIN screen sc ON sc.screen_id = s.screen_id "
        "JOIN theatre t ON t.theatre_id = sc.theatre_id "
        "JOIN movie m ON m.movie_id = s.movie_id "
        "WHERE b.booking_id = %s"
    )
    with get_conn() as conn:
        with conn.cursor(dictionary=True) as cur:
            cur.execute(sql, (booking_id,))
            data = cur.fetchone()
    if not data:
        flash('Booking not found', 'warning')
        return redirect(url_for('shows.list_shows'))

    return render_template('booking_confirmation.html', booking=data)
