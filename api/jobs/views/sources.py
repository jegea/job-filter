from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from jobs.models import JobSource
from jobs.serializers import JobSourceSerializer


@api_view(["GET", "POST"])
def source_list(request):
    if request.method == "GET":
        sources = JobSource.objects.all().order_by("name")
        serializer = JobSourceSerializer(sources, many=True)
        return Response(serializer.data)

    serializer = JobSourceSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PATCH"])
def source_detail(request, pk):
    source = get_object_or_404(JobSource, pk=pk)

    if request.method == "GET":
        serializer = JobSourceSerializer(source)
        return Response(serializer.data)

    serializer = JobSourceSerializer(
        source,
        data=request.data,
        partial=True,
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response(serializer.data)