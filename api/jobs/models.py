from django.db import models
from uuid6 import uuid7


class JobSource(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid7,
        editable=False,
    )
    name = models.CharField(max_length=100)
    url = models.URLField(unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Job(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid7,
        editable=False,
    )
    title = models.CharField(max_length=500)
    url = models.URLField(unique=True)
    source = models.ForeignKey(
        JobSource,
        on_delete=models.PROTECT,
        related_name="jobs",
    )
    published_at = models.DateTimeField(null=True, blank=True)
    is_reviewed = models.BooleanField(default=False)
    filter_result = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class JobKeyword(models.Model):
    class KeywordType(models.TextChoices):
        POSITIVE = "positive", "Positive"
        NEGATIVE = "negative", "Negative"

    id = models.UUIDField(
        primary_key=True,
        default=uuid7,
        editable=False,
    )
    term = models.CharField(max_length=100, unique=True)
    keyword_type = models.CharField(
        max_length=8,
        choices=KeywordType.choices,
        default=KeywordType.POSITIVE,
    )
    weight = models.PositiveSmallIntegerField(
        default=1,
        choices=[(weight, str(weight)) for weight in range(1, 6)],
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["term"]

    def __str__(self):
        return f"{self.term} ({self.keyword_type}, {self.weight})"