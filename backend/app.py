from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB connection
MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(
    MONGO_URI,
    serverSelectionTimeoutMS=5000
)

db = client["CivicFlow"]
complaints = db["complaints"]


@app.route("/")
def home():
    return jsonify({
        "message": "Welcome to CivicFlow Backend!",
        "status": "Running successfully"
    })


@app.route("/api/health")
def health():
    return jsonify({
        "status": "OK",
        "project": "CivicFlow"
    })


@app.route("/api/db-test")
def database_test():
    try:
        client.admin.command("ping")

        return jsonify({
            "status": "success",
            "message": "MongoDB connected successfully!",
            "database": "CivicFlow"
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)