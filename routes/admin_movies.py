from flask import Blueprint, render_template, request, redirect, url_for, flash
from db.connection import get_conn

movies_admin_bp = Blueprint('movies_admin', __name__, url_prefix='/admin/movies')

@movies_admin_bp.get('')
def movies_list():
    q = request.args.get('q', '').strip()
    sql = "SELECT movie_id, title, duration_minutes, genre, language, rating, release_date, status FROM movie"
    params = []
    if q:
        sql += " WHERE title LIKE %s"
        params.append(f"%{q}%")
    sql += " ORDER BY status, title"
    with get_conn() as conn:
        with conn.cursor(dictionary=True) as cur:
            cur.execute(sql, params)
            rows = cur.fetchall()
    return render_template('admin/movies_list.html', items=rows, q=q)

@movies_admin_bp.get('/add')
def movies_add_get():
    return render_template('admin/movie_form.html', item=None)

@movies_admin_bp.post('/add')
def movies_add_post():
    title = request.form.get('title','').strip()
    duration = request.form.get('duration_minutes', type=int)
    genre = request.form.get('genre','').strip() or None
    language = request.form.get('language','').strip() or None
    rating = request.form.get('rating', type=float)
    release_date = request.form.get('release_date') or None
    status = request.form.get('status','now_showing')

    if not title or not duration:
        flash('Title and duration are required', 'danger')
        return redirect(url_for('movies_admin.movies_add_get'))

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO movie (title, duration_minutes, genre, language, rating, release_date, status) "
                "VALUES (%s,%s,%s,%s,%s,%s,%s)",
                (title, duration, genre, language, rating, release_date, status)
            )
            conn.commit()
    flash('Movie added', 'success')
    return redirect(url_for('movies_admin.movies_list'))

@movies_admin_bp.get('/<int:movie_id>/edit')
def movies_edit_get(movie_id: int):
    with get_conn() as conn:
        with conn.cursor(dictionary=True) as cur:
            cur.execute("SELECT * FROM movie WHERE movie_id=%s", (movie_id,))
            item = cur.fetchone()
    if not item:
        flash('Movie not found', 'warning')
        return redirect(url_for('movies_admin.movies_list'))
    return render_template('admin/movie_form.html', item=item)

@movies_admin_bp.post('/<int:movie_id>/edit')
def movies_edit_post(movie_id: int):
    title = request.form.get('title','').strip()
    duration = request.form.get('duration_minutes', type=int)
    genre = request.form.get('genre','').strip() or None
    language = request.form.get('language','').strip() or None
    rating = request.form.get('rating', type=float)
    release_date = request.form.get('release_date') or None
    status = request.form.get('status','now_showing')

    if not title or not duration:
        flash('Title and duration are required', 'danger')
        return redirect(url_for('movies_admin.movies_edit_get', movie_id=movie_id))

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE movie SET title=%s, duration_minutes=%s, genre=%s, language=%s, rating=%s, release_date=%s, status=%s WHERE movie_id=%s",
                (title, duration, genre, language, rating, release_date, status, movie_id)
            )
            conn.commit()
    flash('Movie updated', 'success')
    return redirect(url_for('movies_admin.movies_list'))

@movies_admin_bp.post('/<int:movie_id>/delete')
def movies_delete(movie_id: int):
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM movie WHERE movie_id=%s", (movie_id,))
                conn.commit()
        flash('Movie deleted', 'info')
    except Exception:
        flash('Cannot delete movie that has scheduled shows', 'warning')
    return redirect(url_for('movies_admin.movies_list'))
