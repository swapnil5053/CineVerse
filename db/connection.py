import os
import mysql.connector
from mysql.connector import pooling
from dotenv import load_dotenv

load_dotenv()

_pool = None

def init_pool():
    global _pool
    if _pool is None:
        _pool = pooling.MySQLConnectionPool(
            pool_name="tms_pool",
            pool_size=5,
            host=os.getenv('MYSQL_HOST', 'localhost'),
            port=int(os.getenv('MYSQL_PORT', '3306')),
            database=os.getenv('MYSQL_DB', 'theatre_db'),
            user=os.getenv('MYSQL_USER', 'theatre_app'),
            password=os.getenv('MYSQL_PASSWORD', ''),
            autocommit=False
        )


def get_conn():
    if _pool is None:
        init_pool()
    return _pool.get_connection()
