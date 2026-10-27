from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from jobs.models import JobKeyword
from jobs.serializers import JobKeywordSerializer


@api_view(["GET", "POST"])
def keyword_list(request):
    if request.method == "GET":
        keywords = JobKeyword.objects.all()
        serializer = JobKeywordSerializer(keywords, many=True)
        return Response(serializer.data)

    serializer = JobKeywordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PATCH", "DELETE"])
def keyword_detail(request, pk):
    keyword = get_object_or_404(JobKeyword, pk=pk)

    if request.method == "GET":
        serializer = JobKeywordSerializer(keyword)
        return Response(serializer.data)

    if request.method == "PATCH":
        serializer = JobKeywordSerializer(
            keyword,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

    keyword.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)