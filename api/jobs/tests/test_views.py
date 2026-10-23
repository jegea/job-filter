from rest_framework.test import APITestCase

from jobs.models import Job, JobSource


class JobListViewTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.source = JobSource.objects.create(
            name="Test source",
            url="https://example.com/feed.xml",
        )

        cls.pending_job = Job.objects.create(
            title="Pending Python Developer",
            url="https://example.com/jobs/pending",
            source=cls.source,
            is_reviewed=False,
        )

        cls.reviewed_job = Job.objects.create(
            title="Reviewed Backend Developer",
            url="https://example.com/jobs/reviewed",
            source=cls.source,
            is_reviewed=True,
        )

    def test_returns_all_jobs_when_review_filter_is_missing(self):
        response = self.client.get("/api/jobs/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)

        returned_ids = {
            job["id"] for job in response.data["results"]
        }

        self.assertEqual(
            returned_ids,
            {str(self.pending_job.id), str(self.reviewed_job.id)},
        )

    def test_returns_only_pending_jobs_when_filter_is_false(self):
        response = self.client.get(
            "/api/jobs/",
            {"is_reviewed": "false"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(
            response.data["results"][0]["id"],
            str(self.pending_job.id),
        )

    def test_returns_only_reviewed_jobs_when_filter_is_true(self):
        response = self.client.get(
            "/api/jobs/",
            {"is_reviewed": "true"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(
            response.data["results"][0]["id"],
            str(self.reviewed_job.id),
        )