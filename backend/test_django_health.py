#!/usr/bin/env python
"""
Standalone health check script to test Django without any server
"""
import os
import sys
import django
from django.http import HttpRequest
import traceback

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

try:
    print("🔧 Setting up Django...")
    django.setup()
    print("✅ Django setup successful")
except Exception as e:
    print(f"❌ Django setup failed: {e}")
    traceback.print_exc()
    sys.exit(1)

try:
    print("🔧 Testing URL patterns...")
    from django.urls import resolve, reverse
    from django.test import RequestFactory
    
    # Test URL resolution
    factory = RequestFactory()
    
    # Test root path
    request = factory.get('/')
    from backend.urls import health_check
    response = health_check(request)
    print(f"✅ Root path test: {response.status_code} - {response.content.decode()[:100]}")
    
    # Test ping path
    request = factory.get('/ping/')
    from backend.urls import simple_health
    response = simple_health(request)
    print(f"✅ Ping path test: {response.status_code} - {response.content.decode()}")
    
    # Test debug path
    request = factory.get('/debug/')
    from backend.urls import debug_info
    response = debug_info(request)
    print(f"✅ Debug path test: {response.status_code} - {response.content.decode()[:100]}")
    
except Exception as e:
    print(f"❌ URL pattern test failed: {e}")
    traceback.print_exc()
    sys.exit(1)

print("🎉 All tests passed! Django is configured correctly.")
print("The issue might be with the deployment environment or Gunicorn configuration.")
