from django.db.models import Count, F, FloatField, Q
from django.db.models.fields.json import KeyTextTransform
from django.db.models.functions import Cast
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from jobs.models import Job
from jobs.serializers import JobReviewSerializer, JobSerializer
from jobs.services.job_ingestion import ingest_jobs

@api_view(["GET"])
def job_list(request):
    jobs = Job.objects.select_related("source").all()

    summary = Job.objects.aggregate(
        total=Count("id"),
        pending=Count("id", filter=Q(is_reviewed=False)),
        reviewed=Count("id", filter=Q(is_reviewed=True)),
    )

    is_reviewed = request.query_params.get("is_reviewed")

    if is_reviewed == "true":
        jobs = jobs.filter(is_reviewed=True)
    elif is_reviewed == "false":
        jobs = jobs.filter(is_reviewed=False)

    ordering = request.query_params.get("ordering", "published_at")

    if ordering in ("title", "-title"):
        jobs = jobs.order_by(ordering, "-created_at")

    elif ordering in ("score", "-score"):
        jobs = jobs.annotate(
            score_value=Cast(
                KeyTextTransform("score", "filter_result"),
                FloatField(),
            )
        ).order_by(ordering.replace("score", "score_value"), "-created_at")

    elif ordering == "-published_at":
        jobs = jobs.order_by(
            F("published_at").desc(nulls_last=True),
            "-created_at",
        )

    elif ordering == "published_at":
        jobs = jobs.order_by(
            F("published_at").asc(nulls_first=True),
            "-created_at",
        )

    else:
        jobs = jobs.order_by(
            F("published_at").desc(nulls_last=True),
            "-created_at",
        )

    paginator = PageNumberPagination()
    paginator.page_size = 20

    page = paginator.paginate_queryset(jobs, request)
    serializer = JobSerializer(page, many=True)

    response = paginator.get_paginated_response(serializer.data)
    response.data["summary"] = summary

    return response


@api_view(["PATCH"])
def job_review_update(request, pk):
    job = get_object_or_404(Job, pk=pk)

    serializer = JobReviewSerializer(
        job,
        data=request.data,
        partial=True,
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response(
        JobSerializer(job).data,
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
def job_fetch(request):
    summary = ingest_jobs()

    if summary["sources_processed"] == 0:
        return Response(
            {
                **summary,
                "message": "No active job sources found.",
            },
            status=status.HTTP_200_OK,
        )

    return Response(summary, status=status.HTTP_200_OK)