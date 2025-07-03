#!/bin/bash

echo "=== Starting Mocktopus Backend ==="

# Debug environment
echo "Environment variables:"
echo "PORT: $PORT"
echo "RAILWAY_ENVIRONMENT: $RAILWAY_ENVIRONMENT"
echo "DATABASE_URL: ${DATABASE_URL:0:20}..."
echo "DEBUG: $DEBUG"

# Set environment
export PYTHONPATH=/app:$PYTHONPATH

# Use default port if not set
if [ -z "$PORT" ]; then
    export PORT=8000
    echo "PORT not set, using default 8000"
fi

# Test basic Python and Django
echo "Testing Python..."
python --version

echo "Testing Django settings..."
python -c "import django; print('Django version:', django.get_version())"

echo "Testing Django configuration..."
python manage.py check

echo "Running migrations..."
python manage.py migrate

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Testing if Django can load..."
python -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()
print('✅ Django loaded successfully!')
"

echo "Testing WSGI application..."
python -c "
import os, django
from backend.wsgi import application
print('✅ WSGI application loaded successfully!')
print('WSGI app type:', type(application))
"

echo "Starting Gunicorn on 0.0.0.0:$PORT..."
echo "Gunicorn command: gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT --workers 1 --timeout 120 --log-level debug --access-logfile - --error-logfile - --preload"

exec gunicorn backend.wsgi:application \
    --bind 0.0.0.0:$PORT \
    --workers 1 \
    --timeout 120 \
    --log-level debug \
    --access-logfile - \
    --error-logfile - \
    --preload
