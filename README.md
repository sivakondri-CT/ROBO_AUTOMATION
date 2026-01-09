## Running Celery Worker

Make sure Redis (or your broker) is running, then start the Celery worker:

```bash
celery -A celery_app worker --loglevel=info