#!/usr/bin/env python
"""
Minimal WSGI server for testing Railway deployment
"""
import os
import sys
from wsgiref.simple_server import make_server, WSGIServer
from socketserver import ThreadingMixIn

class ThreadingWSGIServer(ThreadingMixIn, WSGIServer):
    pass

def simple_app(environ, start_response):
    """Simple WSGI app for testing"""
    status = '200 OK'
    headers = [('Content-type', 'text/plain')]
    start_response(status, headers)
    
    response_body = f"""
Mocktopus Simple WSGI Test
==========================
Path: {environ.get('PATH_INFO', '/')}
Method: {environ.get('REQUEST_METHOD', 'GET')}
Server: {environ.get('SERVER_NAME', 'Unknown')}
Port: {environ.get('SERVER_PORT', 'Unknown')}
Remote: {environ.get('REMOTE_ADDR', 'Unknown')}

Environment Variables:
PORT: {os.environ.get('PORT', 'Not Set')}
RAILWAY_ENVIRONMENT: {os.environ.get('RAILWAY_ENVIRONMENT', 'Not Set')}
DATABASE_URL: {'Set' if os.environ.get('DATABASE_URL') else 'Not Set'}

This confirms the WSGI server is working!
"""
    return [response_body.encode('utf-8')]

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    print(f"Starting simple WSGI server on 0.0.0.0:{port}")
    
    server = make_server('0.0.0.0', port, simple_app, server_class=ThreadingWSGIServer)
    print(f"Server running at http://0.0.0.0:{port}/")
    print("Press Ctrl+C to stop")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
        server.shutdown()
