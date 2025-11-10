import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from flask_wtf.csrf import CSRFProtect, generate_csrf

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-not-secure')

    # Session configuration for cross-origin requests
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
    app.config['SESSION_COOKIE_HTTPONLY'] = False
    app.config['SESSION_COOKIE_DOMAIN'] = None

    # Database configuration (MySQL)
    app.config['MYSQL_HOST'] = os.getenv('MYSQL_HOST', 'localhost')
    app.config['MYSQL_PORT'] = int(os.getenv('MYSQL_PORT', '3306'))
    app.config['MYSQL_DB'] = os.getenv('MYSQL_DB', 'theatre_db')
    app.config['MYSQL_USER'] = os.getenv('MYSQL_USER', 'theatre_app')
    app.config['MYSQL_PASSWORD'] = os.getenv('MYSQL_PASSWORD', '')

    # Initialize CORS for frontend communication
    CORS(app, 
         origins=['http://localhost:8080', 'http://localhost:8081', 'http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:8080', 'http://127.0.0.1:8081'], 
         supports_credentials=True,
         allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         expose_headers=['Set-Cookie'])
    
    # Initialize CSRF protection (disable for API routes)
    csrf = CSRFProtect(app)
    app.jinja_env.globals['csrf_token'] = generate_csrf

    # Initialize DB connection pool
    from db.connection import init_pool
    init_pool()

    # Register blueprints
    from routes.main import main_bp
    from routes.auth import auth_bp
    from routes.shows import shows_bp
    from routes.booking import booking_bp
    from routes.admin import admin_bp
    from routes.account import account_bp
    from routes.admin_movies import movies_admin_bp
    from routes.admin_theatres import theatres_admin_bp
    from routes.admin_screens import screens_admin_bp
    from routes.admin_shows import shows_admin_bp
    from routes.admin_customers import customers_admin_bp
    from routes.admin_staff import staff_admin_bp
    from routes.admin_sql_demos import sql_demos_bp
    from routes.api import api_bp
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(shows_bp)
    app.register_blueprint(booking_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(account_bp)
    app.register_blueprint(movies_admin_bp)
    app.register_blueprint(theatres_admin_bp)
    app.register_blueprint(screens_admin_bp)
    app.register_blueprint(shows_admin_bp)
    app.register_blueprint(customers_admin_bp)
    app.register_blueprint(staff_admin_bp)
    app.register_blueprint(sql_demos_bp)
    app.register_blueprint(api_bp)
    
    # Exempt API routes from CSRF protection
    csrf.exempt(api_bp)

    @app.get('/health')
    def health():
        return {'status': 'ok'}

    return app

if __name__ == '__main__':
    app = create_app()
    use_https = os.getenv('USE_HTTPS', '0') in ('1', 'true', 'True')
    ssl_ctx = 'adhoc' if use_https else None
    app.run(host='127.0.0.1', port=5000, debug=True, ssl_context=ssl_ctx)
