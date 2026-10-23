from types import SimpleNamespace
from unittest.mock import patch

from django.test import TestCase

from jobs.models import Job, JobKeyword, JobSource
from jobs.services.job_ingestion import ingest_jobs


class IngestJobsTests(TestCase):
    def test_returns_empty_summary_when_no_active_sources_exist(self):
        result = ingest_jobs()

        self.assertEqual(result["sources_processed"], 0)
        self.assertEqual(result["entries_found"], 0)
        self.assertEqual(result["saved_jobs"], 0)
        self.assertEqual(result["duplicates"], 0)
        self.assertEqual(result["rejected_entries"], 0)
        self.assertEqual(result["errors"], 0)
        self.assertEqual(result["source_errors"], [])
        self.assertEqual(result["results"], [])

    @patch("jobs.services.job_ingestion.feedparser.parse")
    def test_saves_valid_job(self, mock_parse):
        source = JobSource.objects.create(
            name="Test source",
            url="https://example.com/feed.xml",
            is_active=True,
        )

        JobKeyword.objects.create(
            term="Python",
            keyword_type=JobKeyword.KeywordType.POSITIVE,
            weight=5,
            is_active=True,
        )

        mock_parse.return_value = SimpleNamespace(
            bozo=False,
            entries=[
                {
                    "title": "Senior Python Developer",
                    "link": "https://example.com/jobs/123#details",
                    "summary": "Backend development with Python.",
                }
            ],
        )

        result = ingest_jobs()

        self.assertEqual(result["sources_processed"], 1)
        self.assertEqual(result["entries_found"], 1)
        self.assertEqual(result["accepted_entries"], 1)
        self.assertEqual(result["saved_jobs"], 1)
        self.assertEqual(result["duplicates"], 0)
        self.assertEqual(result["rejected_entries"], 0)
        self.assertEqual(result["errors"], 0)

        self.assertEqual(Job.objects.count(), 1)

        job = Job.objects.get()
        self.assertEqual(job.title, "Senior Python Developer")
        self.assertEqual(
            job.url,
            "https://example.com/jobs/123",
        )
        self.assertEqual(job.source, source)
        self.assertEqual(job.filter_result["score"], 5)
        self.assertEqual(result["results"][0]["status"], "saved")

        mock_parse.assert_called_once_with(source.url)

    @patch("jobs.services.job_ingestion.feedparser.parse")
    def test_rejects_job_below_minimum_score(self, mock_parse):
        JobSource.objects.create(
            name="Test source",
            url="https://example.com/feed.xml",
            is_active=True,
        )

        JobKeyword.objects.create(
            term="Python",
            keyword_type=JobKeyword.KeywordType.POSITIVE,
            weight=2,
            is_active=True,
        )

        mock_parse.return_value = SimpleNamespace(
            bozo=False,
            entries=[
                {
                    "title": "Python Developer",
                    "link": "https://example.com/jobs/456",
                    "summary": "Backend development.",
                }
            ],
        )

        result = ingest_jobs()

        self.assertEqual(result["entries_found"], 1)
        self.assertEqual(result["accepted_entries"], 0)
        self.assertEqual(result["saved_jobs"], 0)
        self.assertEqual(result["rejected_entries"], 1)
        self.assertEqual(result["errors"], 0)

        self.assertEqual(Job.objects.count(), 0)
        self.assertEqual(result["results"][0]["status"], "rejected")
        self.assertEqual(result["results"][0]["score"], 2)

    @patch("jobs.services.job_ingestion.feedparser.parse")
    def test_counts_existing_job_as_duplicate(self, mock_parse):
        source = JobSource.objects.create(
            name="Test source",
            url="https://example.com/feed.xml",
            is_active=True,
        )

        JobKeyword.objects.create(
            term="Python",
            keyword_type=JobKeyword.KeywordType.POSITIVE,
            weight=5,
            is_active=True,
        )

        existing_job_url = "https://example.com/jobs/123"

        Job.objects.create(
            title="Senior Python Developer",
            url=existing_job_url,
            source=source,
        )

        mock_parse.return_value = SimpleNamespace(
            bozo=False,
            entries=[
                {
                    "title": "Senior Python Developer",
                    "link": existing_job_url,
                    "summary": "Backend development with Python.",
                }
            ],
        )

        result = ingest_jobs()

        self.assertEqual(result["entries_found"], 1)
        self.assertEqual(result["accepted_entries"], 1)
        self.assertEqual(result["saved_jobs"], 0)
        self.assertEqual(result["duplicates"], 1)
        self.assertEqual(result["errors"], 0)

        self.assertEqual(Job.objects.count(), 1)
        self.assertEqual(result["results"][0]["status"], "duplicate")

    @patch("jobs.services.job_ingestion.feedparser.parse")
    def test_ignores_entries_missing_title_or_url(self, mock_parse):
        JobSource.objects.create(
            name="Test source",
            url="https://example.com/feed.xml",
            is_active=True,
        )

        mock_parse.return_value = SimpleNamespace(
            bozo=False,
            entries=[
                {
                    "title": "",
                    "link": "https://example.com/jobs/123",
                    "summary": "Python development.",
                },
                {
                    "title": "Python Developer",
                    "link": "",
                    "summary": "Python development.",
                },
            ],
        )

        result = ingest_jobs()

        self.assertEqual(result["entries_found"], 2)
        self.assertEqual(result["saved_jobs"], 0)
        self.assertEqual(result["rejected_entries"], 0)
        self.assertEqual(result["errors"], 0)

        self.assertEqual(Job.objects.count(), 0)
        self.assertEqual(
            [item["status"] for item in result["results"]],
            ["invalid", "invalid"],
        )

    @patch("jobs.services.job_ingestion.feedparser.parse")
    def test_continues_processing_sources_after_a_source_error(
        self,
        mock_parse,
    ):
        JobSource.objects.create(
            name="Broken source",
            url="https://example.com/broken.xml",
            is_active=True,
        )

        working_source = JobSource.objects.create(
            name="Working source",
            url="https://example.com/working.xml",
            is_active=True,
        )

        JobKeyword.objects.create(
            term="Python",
            keyword_type=JobKeyword.KeywordType.POSITIVE,
            weight=5,
            is_active=True,
        )

        valid_feed = SimpleNamespace(
            bozo=False,
            entries=[
                {
                    "title": "Senior Python Developer",
                    "link": "https://example.com/jobs/789",
                    "summary": "Backend development with Python.",
                }
            ],
        )

        def parse_feed(url):
            if url == "https://example.com/broken.xml":
                raise RuntimeError("Feed unavailable")

            return valid_feed

        mock_parse.side_effect = parse_feed

        result = ingest_jobs()

        self.assertEqual(result["sources_processed"], 2)
        self.assertEqual(result["entries_found"], 1)
        self.assertEqual(result["saved_jobs"], 1)
        self.assertEqual(result["errors"], 1)

        self.assertEqual(len(result["source_errors"]), 1)
        self.assertEqual(
            result["source_errors"][0]["source"],
            "Broken source",
        )
        self.assertEqual(
            result["source_errors"][0]["error"],
            "Feed unavailable",
        )

        self.assertEqual(Job.objects.count(), 1)
        self.assertEqual(Job.objects.get().source, working_source)
