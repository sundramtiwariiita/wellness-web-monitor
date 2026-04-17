import os

from servercopy import app


if __name__ == "__main__":
    debug_enabled = os.getenv("FLASK_DEBUG", "").lower() in {"1", "true", "yes"}
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=debug_enabled)
