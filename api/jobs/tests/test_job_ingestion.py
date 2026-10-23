from datetime import datetime, timezone
from time import struct_time

from django.test import SimpleTestCase

from jobs.services.job_ingestion import get_published_at, normalize_url

class NormalizeUrlTests(SimpleTestCase):
    def test_removes_url_fragment(self):
        result = normalize_url(
            "https://example.com/jobs/123#description"
        )
        self.assertEqual(result, "https://example.com/jobs/123")

    def test_preserves_query_parameters(self):
        result = normalize_url(
            "https://example.com/jobs/123?source=rss&id=42"
        )
        self.assertEqual(
            result,
            "https://example.com/jobs/123?source=rss&id=42",
        )

    def test_removes_fragment_but_preserves_query_parameters(self):
        result = normalize_url(
            "https://example.com/jobs/123?source=rss#description"
        )
        self.assertEqual(
            result,
            "https://example.com/jobs/123?source=rss",
        )

    def test_removes_surrounding_whitespace(self):
        result = normalize_url(
            "  https://example.com/jobs/123  "
        )
        self.assertEqual(result, "https://example.com/jobs/123")

    def test_url_without_fragment_remains_unchanged(self):
        url = "https://example.com/jobs/123?source=rss"
        self.assertEqual(normalize_url(url), url)

    def test_empty_url_returns_empty_string(self):
        self.assertEqual(normalize_url(""), "")

class GetPublishedAtTests(SimpleTestCase):
    def test_returns_none_when_publication_date_is_missing(self):
        self.assertIsNone(get_published_at({}))

    def test_extracts_publication_date(self):
        entry = {
            "published_parsed": struct_time(
                (2026, 10, 20, 14, 30, 0, 1, 293, 0)
            ),
        }
        result = get_published_at(entry)
        self.assertEqual(
            result,
            datetime(2026, 10, 20, 14, 30, tzinfo=timezone.utc),
        )

    def test_uses_updated_date_when_publication_date_is_missing(self):
        entry = {
            "updated_parsed": struct_time(
                (2026, 10, 21, 9, 15, 0, 2, 294, 0)
            ),
        }
        result = get_published_at(entry)
        self.assertEqual(
            result,
            datetime(2026, 10, 21, 9, 15, tzinfo=timezone.utc),
        )

    def test_prefers_publication_date_over_updated_date(self):
        entry = {
            "published_parsed": struct_time(
                (2026, 10, 20, 14, 30, 0, 1, 293, 0)
            ),
            "updated_parsed": struct_time(
                (2026, 10, 21, 9, 15, 0, 2, 294, 0)
            ),
        }

        result = get_published_at(entry)
        self.assertEqual(
            result,
            datetime(2026, 10, 20, 14, 30, tzinfo=timezone.utc),
        )