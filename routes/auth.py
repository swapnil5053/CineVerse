from flask import Blueprint, render_template, redirect, url_for, request, flash, session
from passlib.hash import pbkdf2_sha256 as bcrypt
from db.connection import get_conn

auth_bp = Blueprint('auth', __name__, url_prefix='/')

@auth_bp.get('register')
def register_get():
    return render_template('register.html')

@auth_bp.post('register')
def register_post():
    name = request.form.get('name', '').strip()
    email = request.form.get('email', '').strip().lower()
    contact_no = request.form.get('contact_no', '').strip()
    password = request.form.get('password', '')

    if not (name and email and password):
        flash('Name, Email, and Password are required', 'danger')
        return redirect(url_for('auth.register_get'))

    # Use PBKDF2-SHA256 (no 72-byte limit). If the library still raises
    # due to edge cases, fallback by hashing a truncated version to guarantee progress.
    try:
        password_hash = bcrypt.hash(password)
    except ValueError:
        password_hash = bcrypt.hash(password[:1024])
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO customer (name, email, contact_no, membership_status, password_hash) VALUES (%s,%s,%s,'none',%s)",
                    (name, email, contact_no, password_hash)
                )
                conn.commit()
        flash('Registration successful. Please log in.', 'success')
        return redirect(url_for('auth.login_get'))
    except Exception:
        flash('Registration failed. Email may already be in use.', 'danger')
        return redirect(url_for('auth.register_get'))

@auth_bp.get('login')
def login_get():
    return render_template('login.html')

@auth_bp.post('login')
def login_post():
    email = request.form.get('email', '').strip().lower()
    password = request.form.get('password', '')

    if not (email and password):
        flash('Email and Password are required', 'danger')
        return redirect(url_for('auth.login_get'))

    with get_conn() as conn:
        with conn.cursor(dictionary=True) as cur:
            cur.execute("SELECT cust_id, name, email, role, password_hash FROM customer WHERE email=%s", (email,))
            user = cur.fetchone()

    if not user or not bcrypt.verify(password, user['password_hash']):
        flash('Invalid credentials', 'danger')
        return redirect(url_for('auth.login_get'))

    session['user_id'] = user['cust_id']
    session['user_name'] = user['name']
    session['role'] = (user.get('role') or 'customer') if isinstance(user, dict) else 'customer'
    flash('Logged in successfully', 'success')
    return redirect(url_for('main.home'))

@auth_bp.get('logout')
def logout():
    session.clear()
    flash('Logged out', 'info')
    return redirect(url_for('main.home'))
