from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from debug_logging import debug_log

load_dotenv()

app = Flask(__name__)
CORS(app)

from routes import register_routes
register_routes(app)
debug_log(
    hypothesis_id="H_ROUTES",
    location="backend-flask/app.py:register_routes",
    message="Flask routes registered",
    data={},
    run_id="pre-fix",
)


@app.route("/api/health")
def health():
    return jsonify({"message": "Flask backend is running"})


if __name__ == "__main__":
    debug_log(
        hypothesis_id="H_STARTUP",
        location="backend-flask/app.py:__main__",
        message="Starting Flask server",
        data={},
        run_id="pre-fix",
    )
    app.run(debug=True, port=5000)
