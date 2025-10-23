# Use Python slim base image
FROM python:3.11-slim

# Set working directory
WORKDIR /blog_app

# Prevent Python from writing .pyc files and buffering stdout
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update \
    && apt-get install -y build-essential libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . /blog_app/

# Collect static files
RUN python manage.py collectstatic --noinput

# Start gunicorn server
CMD gunicorn blog_app.wsgi:application --bind 0.0.0.0:$PORT
