#!/usr/bin/env python
"""
Simple test server to verify Django is working without Gunicorn
"""
import os
import django
from django.core.management import execute_from_command_line
from django.core.wsgi import get_wsgi_application

if __name__ == "__main__":
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    
    print("=== Testing Django Setup ===")
    
    # Test Django setup
    try:
        django.setup()
        print("✅ Django setup successful")
    except Exception as e:
        print(f"❌ Django setup failed: {e}")
        exit(1)
    
    # Test WSGI application
    try:
        application = get_wsgi_application()
        print(f"✅ WSGI application created: {type(application)}")
    except Exception as e:
        print(f"❌ WSGI application failed: {e}")
        exit(1)
    
    # Test Django check
    try:
        from django.core.management import call_command
        call_command('check')
        print("✅ Django check passed")
    except Exception as e:
        print(f"❌ Django check failed: {e}")
        exit(1)
    
    # Get port from environment
    port = os.environ.get('PORT', '8000')
    
    print(f"Starting Django development server on port {port}...")
    execute_from_command_line(['manage.py', 'runserver', f'0.0.0.0:{port}'])
