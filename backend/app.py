from flask import Flask
from flask_cors import CORS
from routes.transit import transit_bp


def create_app():
    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(transit_bp, url_prefix="/api/transit")

    @app.route("/")
    def home():
        return {"message": "NYC Transit Hub backend is running"}

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)