"""PESTPRINT web application and image-classification API."""
import io
import logging
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from PIL import Image, ImageOps, UnidentifiedImageError
from werkzeug.exceptions import RequestEntityTooLarge

from inference import RiceClassifier

ROOT = Path(__file__).resolve().parent
MAX_IMAGE_BYTES = 10 * 1024 * 1024
MAX_IMAGE_PIXELS = 25_000_000
app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = MAX_IMAGE_BYTES + 1024 * 1024
classifier = RiceClassifier(ROOT / 'model' / 'efficientnet_b0_rice_pest.pth')


@app.get('/api/health')
def health():
    return jsonify(
        available=classifier.available,
        classes=list(classifier.classes),
        message='Model ready' if classifier.available else
        'Analysis is unavailable because the trained model could not be loaded. You can still explore the pest guide.',
    )


@app.post('/api/analyze')
def analyze():
    file = request.files.get('image')
    if file is None or not file.filename:
        return jsonify(error='Please choose a JPG or PNG image.'), 400
    if Path(file.filename).suffix.lower() not in {'.jpg', '.jpeg', '.png'}:
        return jsonify(error='Unsupported format. Please choose a JPG, JPEG, or PNG image.'), 400
    raw = file.read(MAX_IMAGE_BYTES + 1)
    if len(raw) > MAX_IMAGE_BYTES:
        return jsonify(error='This image is too large. Choose an image under 10 MB.'), 413
    try:
        with Image.open(io.BytesIO(raw)) as candidate:
            if candidate.format not in {'JPEG', 'PNG'}:
                return jsonify(error='The file contents must be a genuine JPG or PNG image.'), 400
            if candidate.width * candidate.height > MAX_IMAGE_PIXELS:
                return jsonify(error='Image resolution is too large. Use an image under 25 megapixels.'), 400
            candidate.verify()
        with Image.open(io.BytesIO(raw)) as source:
            image = ImageOps.exif_transpose(source).convert('RGB')
    except (UnidentifiedImageError, OSError, ValueError, SyntaxError, Image.DecompressionBombError):
        return jsonify(error='This image could not be read. Please choose a different JPG or PNG.'), 400
    if not classifier.available:
        return jsonify(error='The trained model is unavailable. Please try again after the model is connected.'), 503
    try:
        return jsonify(classifier.predict(image))
    except Exception:
        app.logger.exception('Image analysis failed')
        return jsonify(error='Analysis could not be completed. Please try again.'), 500


@app.errorhandler(RequestEntityTooLarge)
def too_large(_error):
    return jsonify(error='This upload is too large. Choose an image under 10 MB.'), 413


@app.after_request
def response_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    if request.path.startswith('/api/'):
        response.headers['Cache-Control'] = 'no-store'
    return response


@app.get('/')
@app.get('/analyze')
@app.get('/pest-guide')
@app.get('/pest-guide/<slug>')
@app.get('/about')
def frontend(slug=None):
    if not (ROOT / 'static' / 'app' / 'index.html').exists():
        return ("PESTPRINT frontend has not been built. Run 'npm install' and "
                "'npm run build' in the frontend folder, then refresh this page.", 503)
    return send_from_directory(ROOT / 'static' / 'app', 'index.html')


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    app.run(host='127.0.0.1', port=5000, debug=False)
