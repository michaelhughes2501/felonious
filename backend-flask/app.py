from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

from routes import register_routes
register_routes(app)


@app.route("/api/health")
def health():
    return jsonify({"message": "Flask backend is running"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
