"""API validation tests plus a real inference integration check when weights exist."""
import io
import unittest
from unittest.mock import patch

from PIL import Image
import app as web


def image_bytes(format='PNG'):
    stream = io.BytesIO()
    Image.new('RGB', (32, 32), (80, 140, 50)).save(stream, format=format)
    stream.seek(0)
    return stream


class ApiTests(unittest.TestCase):
    def setUp(self):
        self.client = web.app.test_client()

    def test_missing_and_invalid_image(self):
        self.assertEqual(self.client.post('/api/analyze').status_code, 400)
        for filename, data in [('crop.txt', image_bytes()), ('crop.png', io.BytesIO(b'not an image')), ('crop.jpg', image_bytes('GIF'))]:
            response = self.client.post('/api/analyze', data={'image': (data, filename)})
            self.assertEqual(response.status_code, 400)
            self.assertIn('error', response.json)

    def test_size_limit(self):
        response = self.client.post('/api/analyze', data={'image': (io.BytesIO(b'x' * (web.MAX_IMAGE_BYTES + 1)), 'crop.png')})
        self.assertEqual(response.status_code, 413)

    def test_unavailable_model(self):
        with patch.object(web.classifier, 'available', False):
            self.assertFalse(self.client.get('/api/health').json['available'])
            response = self.client.post('/api/analyze', data={'image': (image_bytes(), 'crop.png')})
            self.assertEqual(response.status_code, 503)
            self.assertNotIn('probabilities', response.json)

    def test_inference_error_is_not_exposed(self):
        with patch.object(web.classifier, 'available', True), patch.object(web.classifier, 'predict', side_effect=RuntimeError('private model details')):
            response = self.client.post('/api/analyze', data={'image': (image_bytes(), 'crop.png')})
            self.assertEqual(response.status_code, 500)
            self.assertNotIn('private', response.get_data(as_text=True))

    def test_real_model_probabilities(self):
        if not web.classifier.available:
            self.skipTest('Trained weights unavailable')
        sample = web.ROOT / 'frontend/public/images/rice-leaffolder.jpg'
        with sample.open('rb') as image:
            response = self.client.post('/api/analyze', data={'image': (image, 'crop.jpg')})
        self.assertEqual(response.status_code, 200)
        data = response.json
        self.assertEqual(set(data['probabilities']), set(web.classifier.classes))
        self.assertAlmostEqual(sum(data['probabilities'].values()), 1, places=5)
        self.assertEqual(data['prediction'], max(data['probabilities'], key=data['probabilities'].get))
        self.assertEqual(data['confidence'], data['probabilities'][data['prediction']])
        self.assertEqual(data['unknown_method'], 'trained_class')
        self.assertEqual(response.headers['Cache-Control'], 'no-store')

    def test_frontend_routes(self):
        if not (web.ROOT / 'static/app/index.html').exists():
            self.skipTest('Frontend has not been built')
        for route in ['/', '/analyze', '/pest-guide', '/pest-guide/healthy-rice', '/about']:
            response = self.client.get(route)
            self.assertEqual(response.status_code, 200)
            response.close()


if __name__ == '__main__':
    unittest.main()
