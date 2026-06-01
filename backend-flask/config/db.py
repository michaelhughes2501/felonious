import mysql.connector
import os

from debug_logging import debug_log


def get_db():
    host = os.getenv("DB_HOST", "localhost")
    user = os.getenv("DB_USER", "root")
    db_name = os.getenv("DB_NAME", "felonious")
    has_password = bool(os.getenv("DB_PASS", ""))

    debug_log(
        hypothesis_id="H_DB_CONN",
        location="backend-flask/config/db.py:get_db",
        message="Attempting MySQL connection",
        data={"host": host, "user": user, "database": db_name, "hasPassword": has_password},
        run_id="pre-fix",
    )

    try:
        return mysql.connector.connect(
            host=host,
            user=user,
            password=os.getenv("DB_PASS", ""),
            database=db_name,
        )
    except Exception as e:
        debug_log(
            hypothesis_id="H_DB_CONN",
            location="backend-flask/config/db.py:get_db",
            message="MySQL connection failed",
            data={"errorType": type(e).__name__},
            run_id="pre-fix",
        )
        raise
