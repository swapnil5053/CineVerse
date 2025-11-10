from flask import Blueprint, render_template, request, redirect, url_for, flash
from db.connection import get_conn

shows_admin_bp = Blueprint('shows_admin', __name__, url_prefix='/admin/shows')


def _screen_options():
    with get_conn() as conn:
        with conn.cursor(dictionary=True) as cur:
            cur.execute(
                "SELECT sc.screen_id, sc.name AS screen_name, t.name AS theatre_name, t.city, sc.capacity "
                "FROM screen sc JOIN theatre t ON t.theatre_id=sc.theatre_id WHERE sc.status='active' "
                "ORDER BY t.city, t.name, sc.name"
            )
            return cur.fetchall()


def _movie_options():
    with get_conn() as conn:
        with conn.cursor(dictionary=True) as cur:
            cur.execute(
                "SELECT movie_id, title FROM movie WHERE status IN ('now_showing','upcoming') ORDER BY title"
            )
            return cur.fetchall()


@shows_admin_bp.get('')
def shows_list():
    with get_conn() as conn:
        with conn.cursor(dictionary=True) as cur:
            cur.execute(
                "SELECT s.show_id, s.show_date, s.show_time, s.price_type, s.base_price, s.available_seats, "
                "m.title AS movie_title, sc.name AS screen_name, t.name AS theatre_name, t.city "
                "FROM showtime s JOIN movie m ON m.movie_id=s.movie_id "
                "JOIN screen sc ON sc.screen_id=s.screen_id JOIN theatre t ON t.theatre_id=sc.theatre_id "
                "ORDER BY s.show_date DESC, s.show_time DESC"
            )
            rows = cur.fetchall()
    return render_template('admin/shows_list.html', items=rows)


@shows_admin_bp.get('/add')
def shows_add_get():
    return render_template('admin/show_form.html', item=None, screens=_screen_options(), movies=_movie_options())


@shows_admin_bp.post('/add')
def shows_add_post():
    screen_id = request.form.get('screen_id', type=int)
    movie_id = request.form.get('movie_id', type=int)
    show_date = request.form.get('show_date')
    show_time = request.form.get('show_time')
    price_type = request.form.get('price_type', 'standard')
    base_price = request.form.get('base_price', type=float)

    if not (screen_id and movie_id and show_date and show_time and base_price is not None):
        flash('All fields are required', 'danger')
        return redirect(url_for('shows_admin.shows_add_get'))

    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                # available_seats set by trigger
                cur.execute(
                    "INSERT INTO showtime (screen_id, movie_id, show_date, show_time, price_type, base_price, available_seats) "
                    "VALUES (%s,%s,%s,%s,%s,%s,0)",
                    (screen_id, movie_id, show_date, show_time, price_type, base_price)
                )
                conn.commit()
        flash('Show added', 'success')
    except Exception:
        flash('Add failed (duplicate show slot or invalid data)', 'warning')
    return redirect(url_for('shows_admin.shows_list'))


@shows_admin_bp.get('/<int:show_id>/edit')
def shows_edit_get(show_id: int):
    with get_conn() as conn:
        with conn.cursor(dictionary=True) as cur:
            cur.execute("SELECT * FROM showtime WHERE show_id=%s", (show_id,))
            item = cur.fetchone()
    if not item:
        flash('Show not found', 'warning')
        return redirect(url_for('shows_admin.shows_list'))
    return render_template('admin/show_form.html', item=item, screens=_screen_options(), movies=_movie_options())


@shows_admin_bp.post('/<int:show_id>/edit')
def shows_edit_post(show_id: int):
    screen_id = request.form.get('screen_id', type=int)
    movie_id = request.form.get('movie_id', type=int)
    show_date = request.form.get('show_date')
    show_time = request.form.get('show_time')
    price_type = request.form.get('price_type', 'standard')
    base_price = request.form.get('base_price', type=float)

    if not (screen_id and movie_id and show_date and show_time and base_price is not None):
        flash('All fields are required', 'danger')
        return redirect(url_for('shows_admin.shows_edit_get', show_id=show_id))

    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE showtime SET screen_id=%s, movie_id=%s, show_date=%s, show_time=%s, price_type=%s, base_price=%s WHERE show_id=%s",
                    (screen_id, movie_id, show_date, show_time, price_type, base_price, show_id)
                )
                conn.commit()
        flash('Show updated', 'success')
    except Exception:
        flash('Update failed (duplicate show slot?)', 'warning')
    return redirect(url_for('shows_admin.shows_list'))


@shows_admin_bp.post('/<int:show_id>/delete')
def shows_delete(show_id: int):
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM showtime WHERE show_id=%s", (show_id,))
                conn.commit()
        flash('Show deleted', 'info')
    except Exception:
        flash('Cannot delete show with bookings', 'warning')
    return redirect(url_for('shows_admin.shows_list'))
