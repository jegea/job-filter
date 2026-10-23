from django.urls import path

from . import views

urlpatterns = [
    path("health/", views.health_check, name="health-check"),
    path("jobs/", views.job_list, name="job-list"),
    path("jobs/fetch/", views.job_fetch, name="job-fetch"),
    path(
        "jobs/<uuid:pk>/",
        views.job_review_update,
        name="job-review-update",
    ),
]