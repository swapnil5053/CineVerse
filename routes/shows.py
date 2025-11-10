from flask import Blueprint, request, render_template
from db.connection import get_conn

shows_bp = Blueprint('shows', __name__, url_prefix='/shows')

@shows_bp.get('')
def list_shows():
    movie = request.args.get('movie')
    date = request.args.get('date')  # YYYY-MM-DD
    theatre = request.args.get('theatre')
    page = max(int(request.args.get('page', 1) or 1), 1)
    page_size = 5

    query = [
        "SELECT show_id, theatre_id, theatre_name, city, screen_id, screen_name, screen_type,",
        "movie_id, movie_title, genre, language, show_date, show_time, price_type, base_price, available_seats",
        "FROM v_active_shows WHERE 1=1"
    ]
    params = []

    if movie:
        query.append("AND movie_title LIKE %s")
        params.append(f"%{movie}%")
    if date:
        query.append("AND show_date = %s")
        params.append(date)
    if theatre:
        query.append("AND theatre_name LIKE %s")
        params.append(f"%{theatre}%")

    query.append("ORDER BY show_date, show_time")
    sql = " ".join(query)

    # Count total for pagination
    count_sql = sql.replace(
        "SELECT show_id, theatre_id, theatre_name, city, screen_id, screen_name, screen_type, movie_id, movie_title, genre, language, show_date, show_time, price_type, base_price, available_seats",
        "SELECT COUNT(*)"
    )
    total = 0

    shows = []
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(count_sql, params)
            total = cur.fetchone()[0]
        with get_conn() as conn2:
            with conn2.cursor(dictionary=True) as cur2:
                paginated_sql = sql + " LIMIT %s OFFSET %s"
                cur2.execute(paginated_sql, params + [page_size, (page-1)*page_size])
                shows = cur2.fetchall()

    pages = (total + page_size - 1) // page_size if total else 1
    return render_template(
        'shows.html',
        shows=shows,
        filters={'movie': movie or '', 'date': date or '', 'theatre': theatre or ''},
        page=page,
        pages=pages,
        total=total,
        page_size=page_size
    )
