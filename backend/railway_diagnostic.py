#!/usr/bin/env python
"""
Railway port diagnostic test - Enhanced version
"""
import os
import socket
import sys
import time
from http.server import HTTPServer, BaseHTTPRequestHandler

class DiagnosticHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            self.send_response(200)
            self.send_header('Content-type', 'text/plain')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            # Get all available network info
            hostname = socket.gethostname()
            try:
                local_ip = socket.gethostbyname(hostname)
            except:
                local_ip = "Unable to determine"
            
            response = f"""RAILWAY DIAGNOSTIC SUCCESS!
=============================
✅ Server is responding!
✅ Path: {self.path}
✅ Method: {self.method}
✅ Server Host: {hostname}
✅ Local IP: {local_ip}

Environment Variables:
"""
            # Add all env vars
            for key, value in sorted(os.environ.items()):
                if any(x in key.upper() for x in ['PORT', 'HOST', 'RAILWAY', 'BIND', 'DEBUG']):
                    response += f"  {key}: {value}\n"
            
            response += f"\nAll Environment Variables Count: {len(os.environ)}\n"
            response += f"Python Version: {sys.version}\n"
            response += f"Current Time: {time.strftime('%Y-%m-%d %H:%M:%S')}\n"
            
            self.wfile.write(response.encode())
            print(f"✅ Successfully handled request to {self.path}")
            
        except Exception as e:
            print(f"❌ Error handling request: {e}")
            self.send_error(500, f"Internal error: {e}")
    
    def log_message(self, format, *args):
        print(f"🔄 Request: {format % args}")

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    
    print(f"🚀 Starting Railway diagnostic server...")
    print(f"🔧 PORT from environment: {os.environ.get('PORT', 'NOT SET')}")
    print(f"🔧 Using port: {port}")
    print(f"🔧 RAILWAY_ENVIRONMENT: {os.environ.get('RAILWAY_ENVIRONMENT', 'NOT SET')}")
    
    # Try to bind and start server
    try:
        print(f"🔄 Attempting to bind to 0.0.0.0:{port}...")
        server = HTTPServer(('0.0.0.0', port), DiagnosticHandler)
        print(f"✅ Successfully bound to 0.0.0.0:{port}")
        print(f"🌐 Local hostname: {socket.gethostname()}")
        try:
            print(f"🌐 Local IP: {socket.gethostbyname(socket.gethostname())}")
        except:
            print(f"🌐 Local IP: Unable to determine")
        
        print(f"🎯 Server ready! Waiting for requests...")
        server.serve_forever()
        
    except Exception as e:
        print(f"❌ Failed to bind to 0.0.0.0:{port}: {e}")
        print(f"🔄 Trying 127.0.0.1:{port} instead...")
        try:
            server = HTTPServer(('127.0.0.1', port), DiagnosticHandler)
            print(f"✅ Successfully bound to 127.0.0.1:{port}")
            server.serve_forever()
        except Exception as e2:
            print(f"❌ Also failed to bind to 127.0.0.1:{port}: {e2}")
            print(f"💀 Cannot start server on any interface")
            sys.exit(1)
