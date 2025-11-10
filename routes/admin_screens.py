from flask import Blueprint, render_template, request, redirect, url_for, flash
from db.connection import get_conn

screens_admin_bp = Blueprint('screens_admin', __name__, url_prefix='/admin/screens')


def _theatre_options():
    with get_conn() as conn:
        with conn.cursor(dictionary=True) as cur:
            cur.execute("SELECT theatre_id, name, city FROM theatre ORDER BY city, name")
            return cur.fetchall()


@screens_admin_bp.get('')
def screens_list():
    with get_conn() as conn:
        with conn.cursor(dictionary=True) as cur:
            cur.execute(
                "SELECT sc.screen_id, sc.name, sc.type, sc.capacity, sc.status, t.name AS theatre_name, t.city "
                "FROM screen sc JOIN theatre t ON t.theatre_id=sc.theatre_id ORDER BY t.city, t.name, sc.name"
            )
            rows = cur.fetchall()
    return render_template('admin/screens_list.html', items=rows)


@screens_admin_bp.get('/add')
def screens_add_get():
    return render_template('admin/screen_form.html', item=None, theatres=_theatre_options())


@screens_admin_bp.post('/add')
def screens_add_post():
    theatre_id = request.form.get('theatre_id', type=int)
    name = request.form.get('name', '').strip()
    type_ = request.form.get('type', 'standard')
    capacity = request.form.get('capacity', type=int)
    status = request.form.get('status', 'active')

    if not (theatre_id and name and capacity and capacity > 0):
        flash('Theatre, name and positive capacity are required', 'danger')
        return redirect(url_for('screens_admin.screens_add_get'))

    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO screen (theatre_id, name, type, capacity, status) VALUES (%s,%s,%s,%s,%s)",
                    (theatre_id, name, type_, capacity, status)
                )
                conn.commit()
        flash('Screen added', 'success')
    except Exception:
        flash('Add failed (duplicate name in theatre?)', 'warning')
    return redirect(url_for('screens_admin.screens_list'))


@screens_admin_bp.get('/<int:screen_id>/edit')
def screens_edit_get(screen_id: int):
    with get_conn() as conn:
        with conn.cursor(dictionary=True) as cur:
            cur.execute("SELECT * FROM screen WHERE screen_id=%s", (screen_id,))
            item = cur.fetchone()
    if not item:
        flash('Screen not found', 'warning')
        return redirect(url_for('screens_admin.screens_list'))
    return render_template('admin/screen_form.html', item=item, theatres=_theatre_options())


@screens_admin_bp.post('/<int:screen_id>/edit')
def screens_edit_post(screen_id: int):
    theatre_id = request.form.get('theatre_id', type=int)
    name = request.form.get('name', '').strip()
    type_ = request.form.get('type', 'standard')
    capacity = request.form.get('capacity', type=int)
    status = request.form.get('status', 'active')

    if not (theatre_id and name and capacity and capacity > 0):
        flash('Theatre, name and positive capacity are required', 'danger')
        return redirect(url_for('screens_admin.screens_edit_get', screen_id=screen_id))

    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE screen SET theatre_id=%s, name=%s, type=%s, capacity=%s, status=%s WHERE screen_id=%s",
                    (theatre_id, name, type_, capacity, status, screen_id)
                )
                conn.commit()
        flash('Screen updated', 'success')
    except Exception:
        flash('Update failed', 'warning')
    return redirect(url_for('screens_admin.screens_list'))


@screens_admin_bp.post('/<int:screen_id>/delete')
def screens_delete(screen_id: int):
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM screen WHERE screen_id=%s", (screen_id,))
                conn.commit()
        flash('Screen deleted', 'info')
    except Exception:
        flash('Cannot delete screen with scheduled shows', 'warning')
    return redirect(url_for('screens_admin.screens_list'))
