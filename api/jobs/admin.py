from django.contrib import admin

from .models import Job, JobKeyword, JobSource

@admin.register(JobSource)
class JobSourceAdmin(admin.ModelAdmin):
    list_display = ("name", "url", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("name", "url")
    ordering = ("name",)

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "source",
        "published_at",
        "is_reviewed",
        "created_at",
    )
    list_filter = ("is_reviewed", "source")
    search_fields = ("title", "url")
    ordering = ("-created_at",)
    list_editable = ("is_reviewed",)
    list_select_related = ("source",)

@admin.register(JobKeyword)

class JobKeywordAdmin(admin.ModelAdmin):
    list_display = (
        "term",
        "keyword_type",
        "weight",
        "is_active",
        "created_at",
        "updated_at",
    )
    list_filter = ("keyword_type", "is_active", "weight")
    search_fields = ("term",)
    list_editable = ("keyword_type", "weight", "is_active")
    ordering = ("term",)
