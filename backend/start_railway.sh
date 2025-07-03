#!/bin/bash

echo "=== Railway-optimized Mocktopus Backend Start ==="

# Railway-specific environment setup
export PYTHONUNBUFFERED=1
export PYTHONPATH=/app:$PYTHONPATH

# Railway sets PORT, but let's ensure it's available
PORT=${PORT:-8000}
echo "🚀 Starting on port: $PORT"

# Debug Railway environment
echo "🔍 Railway Environment Check:"
echo "RAILWAY_ENVIRONMENT: ${RAILWAY_ENVIRONMENT:-Not Set}"
echo "RAILWAY_PROJECT_ID: ${RAILWAY_PROJECT_ID:-Not Set}"
echo "RAILWAY_SERVICE_ID: ${RAILWAY_SERVICE_ID:-Not Set}"
echo "DATABASE_URL set: $([ -n "$DATABASE_URL" ] && echo "Yes" || echo "No")"

# Test basic setup first
echo "🧪 Pre-flight checks..."
python --version
python -c "import django; print('Django version:', django.get_version())"

# Django setup checks
echo "🔧 Django configuration check..."
python manage.py check --deploy

echo "🗃️ Database migration..."
python manage.py migrate --noinput

echo "📁 Static files collection..."
python manage.py collectstatic --noinput --clear

# Test Django can import and serve
echo "🧪 Testing Django WSGI..."
python -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()
from backend.wsgi import application
print('✅ WSGI application ready')
"

# Railway-optimized Gunicorn configuration
echo "🚀 Starting Gunicorn with Railway-optimized settings..."

exec gunicorn backend.wsgi:application \
    --bind 0.0.0.0:$PORT \
    --workers 2 \
    --worker-class sync \
    --worker-connections 1000 \
    --timeout 120 \
    --keepalive 2 \
    --max-requests 1000 \
    --max-requests-jitter 50 \
    --preload \
    --log-level info \
    --access-logfile - \
    --error-logfile - \
    --access-logformat '%h %l %u %t "%r" %s %b "%{Referer}i" "%{User-Agent}i" %D' \
    --capture-output
