from django.urls import path

from .views import health, jobs, keywords, sources

urlpatterns = [
    path("health/", health.health_check, name="health-check"),
    path("jobs/", jobs.job_list, name="job-list"),
    path("jobs/fetch/", jobs.job_fetch, name="job-fetch"),
    path("jobs/<uuid:pk>/", jobs.job_review_update, name="job-review-update"),
    path("sources/", sources.source_list, name="source-list"),
    path("sources/<uuid:pk>/", sources.source_detail, name="source-detail"),
    path("keywords/", keywords.keyword_list, name="keyword-list"),
    path("keywords/<uuid:pk>/", keywords.keyword_detail, name="keyword-detail"),
]