#!/bin/bash

echo "=== Railway Production Start ==="

# Ensure environment
export PYTHONUNBUFFERED=1
export FORWARDED_ALLOW_IPS="*"
export GUNICORN_CMD_ARGS="--access-logfile -"

PORT=${PORT:-8000}
echo "Starting on port: $PORT"

# Basic Django checks
python manage.py migrate --noinput
python manage.py collectstatic --noinput

# Start with Railway-specific Gunicorn settings
exec gunicorn backend.wsgi:application \
    --bind 0.0.0.0:$PORT \
    --workers 1 \
    --worker-class sync \
    --timeout 60 \
    --keepalive 5 \
    --log-level debug \
    --access-logfile - \
    --error-logfile - \
    --forwarded-allow-ips="*" \
    --proxy-allow-ips="*"
