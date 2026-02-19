#!/bin/sh

echo "=========================================="
echo "Starting English Learning App..."
echo "=========================================="

# Wait for database to be ready (if using external DB)
echo "Waiting for database..."
sleep 5

# Run database migrations
echo "Running database migrations..."
python manage.py migrate --run-syncdb

# Check if migrations were successful
if [ $? -eq 0 ]; then
    echo "✓ Database migrations completed successfully!"
else
    echo "✗ Database migrations failed!"
    echo "Trying to create tables manually..."
    python manage.py migrate --run-syncdb --verbosity=2
fi

# Create default superuser if not exists (optional)
# echo "Creating default admin user..."
# echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@example.com', 'admin123')" | python manage.py shell

echo "=========================================="
echo "Starting Gunicorn server..."
echo "=========================================="

# Start gunicorn
exec gunicorn \
    --bind 0.0.0.0:8000 \
    --workers 4 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --capture-output \
    --enable-stdio-inheritance \
    english_learning.wsgi:application
