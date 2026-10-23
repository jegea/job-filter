import logging
from datetime import datetime, timezone
from urllib.parse import urldefrag

import feedparser
from django.db import IntegrityError, transaction

from jobs.filtering import score_job
from jobs.models import Job, JobSource

MINIMUM_SCORE = 5

logger = logging.getLogger(__name__)

def normalize_url(url: str) -> str:
    """Normalize a job URL without removing query parameters."""
    return urldefrag(url.strip()).url

def get_published_at(entry):
    """Extract the publication date from a feed entry."""
    published = (
    entry.get("published_parsed")
    or entry.get("updated_parsed")
    )

    if published is None:
        return None
    
    return datetime(*published[:6], tzinfo=timezone.utc)

def ingest_jobs():
    """Fetch, filter and save jobs from all active sources."""

    logger.info("Fetching jobs from active sources...")

    summary = {
        "sources_processed": 0,
        "entries_found": 0,
        "accepted_entries": 0,
        "saved_jobs": 0,
        "duplicates": 0,
        "rejected_entries": 0,
        "errors": 0,
        "source_errors": [],
        "results": [],
    }

    sources = JobSource.objects.filter(is_active=True)
    for source in sources:
        summary["sources_processed"] += 1

        try:
            feed = feedparser.parse(source.url)
            logger.info(f"Processing feed from {source.name}")

            if feed.bozo:
                logger.warning(
                    "Feed parsing warning for %s: %s",
                    source.name,
                    feed.bozo_exception,
                )
                pass

            entries = feed.entries
            summary["entries_found"] += len(entries)

            logger.info(
                "Found %s entries in %s",
                len(entries),
                source.name,
            )

            for entry in entries:
                title = entry.get("title", "").strip()
                original_url = entry.get("link", "").strip()

                result_item = {
                    "title": title,
                    "url": normalize_url(original_url) if original_url else "",
                    "source": source.name,
                    "score": None,
                    "status": "invalid",
                }

                if not title or not original_url:
                    summary["results"].append(result_item)
                    logger.info(
                        "Invalid feed entry in %s: missing title or URL",
                        source.name,
                    )
                    continue

                url = normalize_url(original_url)

                description = (
                    entry.get("summary")
                    or entry.get("description")
                    or ""
                ).strip()

                result = score_job(title, description)
                result_item["score"] = result["score"]

                if result["score"] < MINIMUM_SCORE:
                    summary["rejected_entries"] += 1
                    result_item["status"] = "rejected"
                    summary["results"].append(result_item)

                    logger.info(
                        "Job rejected: %s | %s | %s | %s",
                        title,
                        source.name,
                        url,
                        result["score"],
                    )
                    continue

                summary["accepted_entries"] += 1

                try:
                    with transaction.atomic():
                        _, created = Job.objects.get_or_create(
                            url=url,
                            defaults={
                                "title": title,
                                "source": source,
                                "published_at": get_published_at(entry),
                                "filter_result": {
                                    "version": 1,
                                    "threshold": MINIMUM_SCORE,
                                    **result,
                                },
                            },
                        )
                except IntegrityError:
                    # Do not assume every integrity error is a duplicate.
                    # Let unexpected database errors be investigated.
                    logger.exception(
                        "Integrity error while saving job: %s | %s | %s",
                        title,
                        source.name,
                        url,
                    )
                    summary["duplicates"] += 1
                    continue

                if created:
                    summary["saved_jobs"] += 1
                    result_item["status"] = "saved"

                    logger.info(
                        "New job created: %s | %s | %s | %s",
                        title,
                        source.name,
                        url,
                        result["score"],
                    )
                else:
                    summary["duplicates"] += 1
                    result_item["status"] = "duplicate"
                    logger.info(
                        "Job already exists: %s | %s | %s",
                        title,
                        source.name,
                        url,
                    )

                summary["results"].append(result_item)

        except Exception as exc:
            summary["errors"] += 1
            summary["source_errors"].append({
                "source": source.name,
                "error": str(exc),
            })

            logger.exception(
                "Error processing source %s",
                source.name,
            )

    return summary