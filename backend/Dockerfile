# Use official Python base image
FROM python:3.11-slim

# Allow build-time override of FLASK_ENV
ARG FLASK_ENV=production
ENV FLASK_ENV=${FLASK_ENV}

# Don’t write .pyc, unbuffered stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# System deps for psycopg2, etc.
RUN apt-get update \
 && apt-get install -y build-essential libpq-dev \
 && rm -rf /var/lib/apt/lists/*

# Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# App code
COPY . .

EXPOSE 5000

# On container start: init/migrate (once), always upgrade, then run Flask
CMD [ "sh", "-lc", "\
    if [ ! -d migrations ]; then \
      flask db init && \
      flask db migrate -m 'initial schema'; \
    fi && \
    flask db upgrade && \
    exec flask run --host=0.0.0.0 --port=5000 --reload\
  " ]
