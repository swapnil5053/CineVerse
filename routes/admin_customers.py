from flask import Blueprint, render_template, request, redirect, url_for, flash
from db.connection import get_conn

customers_admin_bp = Blueprint('customers_admin', __name__, url_prefix='/admin/customers')

@customers_admin_bp.get('')
def customers_list():
    q = request.args.get('q', '').strip()
    sql = "SELECT cust_id, name, email, contact_no, membership_status FROM customer"
    params = []
    if q:
        sql += " WHERE name LIKE %s OR email LIKE %s"
        params.extend([f"%{q}%", f"%{q}%"])
    sql += " ORDER BY name"
    with get_conn() as conn:
        with conn.cursor(dictionary=True) as cur:
            cur.execute(sql, params)
            rows = cur.fetchall()
    return render_template('admin/customers_list.html', items=rows, q=q)

@customers_admin_bp.get('/<int:cust_id>/edit')
def customers_edit_get(cust_id: int):
    with get_conn() as conn:
        with conn.cursor(dictionary=True) as cur:
            cur.execute("SELECT cust_id, name, email, contact_no, membership_status FROM customer WHERE cust_id=%s", (cust_id,))
            item = cur.fetchone()
    if not item:
        flash('Customer not found', 'warning')
        return redirect(url_for('customers_admin.customers_list'))
    return render_template('admin/customer_form.html', item=item)

@customers_admin_bp.post('/<int:cust_id>/edit')
def customers_edit_post(cust_id: int):
    name = request.form.get('name','').strip()
    contact_no = request.form.get('contact_no','').strip() or None
    membership_status = request.form.get('membership_status','none')
    if not name:
        flash('Name is required', 'danger')
        return redirect(url_for('customers_admin.customers_edit_get', cust_id=cust_id))
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE customer SET name=%s, contact_no=%s, membership_status=%s WHERE cust_id=%s",
                (name, contact_no, membership_status, cust_id)
            )
            conn.commit()
    flash('Customer updated', 'success')
    return redirect(url_for('customers_admin.customers_list'))
