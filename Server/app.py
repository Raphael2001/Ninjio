from flask import Flask
from config import Config
from db import db
from models import User, Feature, Upvote
from routes import bp as api_bp
from flask_jwt_extended import JWTManager
from flask_cors import CORS

app = Flask(__name__)
app.config.from_object(Config)


from flask_cors import CORS

CORS(app, resources={r"/api/*": {
    "origins": "http://localhost:3000",
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"]
}})


db.init_app(app)
jwt = JWTManager(app)

app.register_blueprint(api_bp, url_prefix="/api")

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
