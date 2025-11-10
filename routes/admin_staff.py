from flask import Blueprint, render_template, request, redirect, url_for, flash
from db.connection import get_conn

staff_admin_bp = Blueprint('staff_admin', __name__, url_prefix='/admin/staff')


def _theatre_options():
    with get_conn() as conn:
        with conn.cursor(dictionary=True) as cur:
            cur.execute("SELECT theatre_id, name, city FROM theatre ORDER BY city, name")
            return cur.fetchall()


@staff_admin_bp.get('')
def staff_list():
    with get_conn() as conn:
        with conn.cursor(dictionary=True) as cur:
            cur.execute(
                "SELECT s.staff_id, s.name, s.role, s.contact_no, s.salary, t.name AS theatre_name, t.city "
                "FROM staff s JOIN theatre t ON t.theatre_id=s.theatre_id ORDER BY t.city, t.name, s.name"
            )
            rows = cur.fetchall()
    return render_template('admin/staff_list.html', items=rows)


@staff_admin_bp.get('/add')
def staff_add_get():
    return render_template('admin/staff_form.html', item=None, theatres=_theatre_options())


@staff_admin_bp.post('/add')
def staff_add_post():
    theatre_id = request.form.get('theatre_id', type=int)
    name = request.form.get('name','').strip()
    role = request.form.get('role','').strip()
    contact_no = request.form.get('contact_no','').strip() or None
    salary = request.form.get('salary', type=float)

    if not (theatre_id and name and role and salary is not None):
        flash('Theatre, name, role, and salary are required', 'danger')
        return redirect(url_for('staff_admin.staff_add_get'))

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO staff (theatre_id, name, role, contact_no, salary) VALUES (%s,%s,%s,%s,%s)",
                (theatre_id, name, role, contact_no, salary)
            )
            conn.commit()
    flash('Staff added', 'success')
    return redirect(url_for('staff_admin.staff_list'))


@staff_admin_bp.get('/<int:staff_id>/edit')
def staff_edit_get(staff_id: int):
    with get_conn() as conn:
        with conn.cursor(dictionary=True) as cur:
            cur.execute("SELECT * FROM staff WHERE staff_id=%s", (staff_id,))
            item = cur.fetchone()
    if not item:
        flash('Staff not found', 'warning')
        return redirect(url_for('staff_admin.staff_list'))
    return render_template('admin/staff_form.html', item=item, theatres=_theatre_options())


@staff_admin_bp.post('/<int:staff_id>/edit')
def staff_edit_post(staff_id: int):
    theatre_id = request.form.get('theatre_id', type=int)
    name = request.form.get('name','').strip()
    role = request.form.get('role','').strip()
    contact_no = request.form.get('contact_no','').strip() or None
    salary = request.form.get('salary', type=float)

    if not (theatre_id and name and role and salary is not None):
        flash('Theatre, name, role, and salary are required', 'danger')
        return redirect(url_for('staff_admin.staff_edit_get', staff_id=staff_id))

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE staff SET theatre_id=%s, name=%s, role=%s, contact_no=%s, salary=%s WHERE staff_id=%s",
                (theatre_id, name, role, contact_no, salary, staff_id)
            )
            conn.commit()
    flash('Staff updated', 'success')
    return redirect(url_for('staff_admin.staff_list'))


@staff_admin_bp.post('/<int:staff_id>/delete')
def staff_delete(staff_id: int):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM staff WHERE staff_id=%s", (staff_id,))
            conn.commit()
    flash('Staff deleted', 'info')
    return redirect(url_for('staff_admin.staff_list'))
