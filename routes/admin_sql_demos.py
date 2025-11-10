from flask import Blueprint, render_template, request, flash
from db.connection import get_conn

sql_demos_bp = Blueprint('sql_demos', __name__, url_prefix='/admin/sql-demos')

@sql_demos_bp.get('/')
def index():
    return render_template('admin/sql_demos.html')

@sql_demos_bp.get('/join')
def join_query():
    city = request.args.get('city', default='Bengaluru')
    rows = []
    with get_conn() as conn:
        cur = conn.cursor(dictionary=True, prepared=True)
        cur.execute(
            (
                "SELECT s.show_id, t.name AS theatre, t.city, sc.name AS screen, m.title AS movie, "
                "s.show_date, s.show_time, s.base_price, s.available_seats "
                "FROM showtime s "
                "JOIN screen sc ON sc.screen_id = s.screen_id "
                "JOIN theatre t ON t.theatre_id = sc.theatre_id "
                "JOIN movie m ON m.movie_id = s.movie_id "
                "WHERE t.city = ? ORDER BY s.show_date, s.show_time"
            ),
            (city,)
        )
        rows = cur.fetchall()
    return render_template('admin/sql_demos.html', join_rows=rows, join_city=city)

@sql_demos_bp.get('/aggregate')
def aggregate_query():
    start = request.args.get('start')
    end = request.args.get('end')
    rows = []
    if start and end:
        with get_conn() as conn:
            cur = conn.cursor(dictionary=True, prepared=True)
            cur.execute(
                (
                    "SELECT DATE(booking_time) AS day, SUM(total_amount) AS revenue, "
                    "SUM(CASE WHEN status='confirmed' THEN 1 ELSE 0 END) AS confirmed_count "
                    "FROM booking WHERE booking_time BETWEEN ? AND ? GROUP BY DATE(booking_time) ORDER BY day"
                ),
                (start, end)
            )
            rows = cur.fetchall()
    return render_template('admin/sql_demos.html', agg_rows=rows, agg_start=start, agg_end=end)

@sql_demos_bp.get('/nested')
def nested_query():
    """
    Customers who booked shows of the top-revenue movie (nested subquery over aggregate per movie).
    """
    rows = []
    with get_conn() as conn:
        cur = conn.cursor(dictionary=True)
        cur.execute(
            """
            SELECT DISTINCT c.cust_id, c.name, c.email
            FROM customer c
            JOIN booking b ON b.cust_id = c.cust_id AND b.status='confirmed'
            JOIN showtime s ON s.show_id = b.show_id
            WHERE s.movie_id = (
                SELECT movie_id FROM (
                    SELECT s2.movie_id, SUM(b2.total_amount) AS rev
                    FROM booking b2
                    JOIN showtime s2 ON s2.show_id = b2.show_id
                    WHERE b2.status='confirmed'
                    GROUP BY s2.movie_id
                    ORDER BY rev DESC
                    LIMIT 1
                ) AS topm
            )
            ORDER BY c.name
            """
        )
        rows = cur.fetchall()
    return render_template('admin/sql_demos.html', nested_rows=rows)

@sql_demos_bp.get('/function')
def function_demo():
    show_id = request.args.get('show_id', type=int)
    result = None
    if show_id:
        with get_conn() as conn:
            cur = conn.cursor()
            cur.execute("SELECT fn_show_revenue(%s)", (show_id,))
            row = cur.fetchone()
            if row:
                result = float(row[0]) if row[0] is not None else 0.0
    return render_template('admin/sql_demos.html', fn_show_id=show_id, fn_result=result)

@sql_demos_bp.get('/procedure')
def procedure_demo():
    start = request.args.get('start')
    end = request.args.get('end')
    result = None
    if start and end:
        with get_conn() as conn:
            cur = conn.cursor()
            # CALL with OUT parameter
            cur.execute("SET @p_total = 0")
            cur.execute("CALL sp_get_total_revenue(%s,%s,@p_total)", (start, end))
            cur.execute("SELECT @p_total")
            row = cur.fetchone()
            if row:
                result = float(row[0]) if row[0] is not None else 0.0
    return render_template('admin/sql_demos.html', sp_start=start, sp_end=end, sp_result=result)
