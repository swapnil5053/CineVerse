from flask import Blueprint, render_template, request, redirect, url_for, flash
from db.connection import get_conn

theatres_admin_bp = Blueprint('theatres_admin', __name__, url_prefix='/admin/theatres')

@theatres_admin_bp.get('')
def theatres_list():
    with get_conn() as conn:
        with conn.cursor(dictionary=True) as cur:
            cur.execute("SELECT theatre_id, name, city, contact_no, address FROM theatre ORDER BY city, name")
            rows = cur.fetchall()
    return render_template('admin/theatres_list.html', items=rows)

@theatres_admin_bp.get('/add')
def theatres_add_get():
    return render_template('admin/theatre_form.html', item=None)

@theatres_admin_bp.post('/add')
def theatres_add_post():
    name = request.form.get('name','').strip()
    city = request.form.get('city','').strip()
    contact_no = request.form.get('contact_no','').strip() or None
    address = request.form.get('address','').strip()
    if not (name and city and address):
        flash('Name, City and Address are required', 'danger')
        return redirect(url_for('theatres_admin.theatres_add_get'))
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO theatre (name, city, contact_no, address) VALUES (%s,%s,%s,%s)",
                    (name, city, contact_no, address)
                )
                conn.commit()
        flash('Theatre added', 'success')
    except Exception:
        flash('Theatre add failed (maybe duplicate name in city)', 'warning')
    return redirect(url_for('theatres_admin.theatres_list'))

@theatres_admin_bp.get('/<int:theatre_id>/edit')
def theatres_edit_get(theatre_id: int):
    with get_conn() as conn:
        with conn.cursor(dictionary=True) as cur:
            cur.execute("SELECT * FROM theatre WHERE theatre_id=%s", (theatre_id,))
            item = cur.fetchone()
    if not item:
        flash('Theatre not found', 'warning')
        return redirect(url_for('theatres_admin.theatres_list'))
    return render_template('admin/theatre_form.html', item=item)

@theatres_admin_bp.post('/<int:theatre_id>/edit')
def theatres_edit_post(theatre_id: int):
    name = request.form.get('name','').strip()
    city = request.form.get('city','').strip()
    contact_no = request.form.get('contact_no','').strip() or None
    address = request.form.get('address','').strip()
    if not (name and city and address):
        flash('Name, City and Address are required', 'danger')
        return redirect(url_for('theatres_admin.theatres_edit_get', theatre_id=theatre_id))
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE theatre SET name=%s, city=%s, contact_no=%s, address=%s WHERE theatre_id=%s",
                    (name, city, contact_no, address, theatre_id)
                )
                conn.commit()
        flash('Theatre updated', 'success')
    except Exception:
        flash('Update failed', 'warning')
    return redirect(url_for('theatres_admin.theatres_list'))

@theatres_admin_bp.post('/<int:theatre_id>/delete')
def theatres_delete(theatre_id: int):
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM theatre WHERE theatre_id=%s", (theatre_id,))
                conn.commit()
        flash('Theatre deleted', 'info')
    except Exception:
        flash('Cannot delete theatre with linked screens', 'warning')
    return redirect(url_for('theatres_admin.theatres_list'))
