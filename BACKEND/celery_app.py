from celery import Celery

celery = Celery(
    "robo_automation",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
)

celery.conf.update(
    task_track_started=True,
    result_expires=3600,
)

import tasks