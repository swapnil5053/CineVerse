from functools import wraps
from flask import session, redirect, url_for, flash

def login_required(view_func):
    @wraps(view_func)
    def wrapper(*args, **kwargs):
        if not session.get('user_id'):
            flash('Please log in to continue', 'warning')
            return redirect(url_for('auth.login_get'))
        return view_func(*args, **kwargs)
    return wrapper
