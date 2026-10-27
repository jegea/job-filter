from rest_framework import serializers

from .models import Job, JobKeyword, JobSource

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

class JobSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobSource
        fields = [
            "id", 
            "name", 
            "url", 
            "is_active", 
            "created_at"
        ]
        read_only_fields = ["id", "created_at"]

class JobKeywordSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobKeyword
        fields = [
            "id",
            "term",
            "keyword_type",
            "weight",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]