from rest_framework import serializers

from .models import Job

class JobSerializer(serializers.ModelSerializer):
    source_name = serializers.CharField(
        source="source.name",
        read_only=True,
    )

    class Meta:
        model = Job
        fields = [
            "id",
            "title",
            "url",
            "source",
            "source_name",
            "published_at",
            "is_reviewed",
            "filter_result",
            "created_at",
        ]
        read_only_fields = fields

class JobReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = ["is_reviewed"]