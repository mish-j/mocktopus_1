#!/usr/bin/env python
"""
Ultra-simple HTTP server test for Railway
"""
import os
from http.server import HTTPServer, BaseHTTPRequestHandler

class SimpleHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        
        response = f"""Simple HTTP Server Test
Path: {self.path}
Railway Environment: {os.environ.get('RAILWAY_ENVIRONMENT', 'Not Set')}
Port: {os.environ.get('PORT', 'Not Set')}
"""
        self.wfile.write(response.encode())
    
    def log_message(self, format, *args):
        # Override to reduce log noise
        print(f"Request: {format % args}")

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    
    print(f"=== RAILWAY DEBUG INFO ===")
    print(f"PORT env var: {os.environ.get('PORT', 'NOT SET')}")
    print(f"RAILWAY_ENVIRONMENT: {os.environ.get('RAILWAY_ENVIRONMENT', 'NOT SET')}")
    print(f"RAILWAY_SERVICE_ID: {os.environ.get('RAILWAY_SERVICE_ID', 'NOT SET')}")
    print(f"Attempting to bind to: 0.0.0.0:{port}")
    
    try:
        server = HTTPServer(('0.0.0.0', port), SimpleHandler)
        print(f"✅ Successfully bound to 0.0.0.0:{port}")
        print(f"🚀 Simple HTTP server running on 0.0.0.0:{port}")
        server.serve_forever()
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        import traceback
        traceback.print_exc()
