from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from jobs.models import JobSource


class JobSourceListViewTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.active_source = JobSource.objects.create(
            name="Active source",
            url="https://example.com/active-feed.xml",
            is_active=True,
        )

        cls.inactive_source = JobSource.objects.create(
            name="Inactive source",
            url="https://example.com/inactive-feed.xml",
            is_active=False,
        )

    def test_returns_all_sources_including_inactive_ones(self):
        response = self.client.get("/api/sources/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

        returned_ids = {source["id"] for source in response.data}

        self.assertEqual(
            returned_ids,
            {str(self.active_source.id), str(self.inactive_source.id)},
        )

    def test_returns_sources_ordered_by_name(self):
        response = self.client.get("/api/sources/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            [source["name"] for source in response.data],
            ["Active source", "Inactive source"],
        )

    def test_returns_empty_list_when_no_sources_exist(self):
        JobSource.objects.all().delete()

        response = self.client.get("/api/sources/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])

    def test_returns_expected_source_fields(self):
        response = self.client.get("/api/sources/")

        self.assertEqual(response.status_code, 200)

        source = response.data[0]

        self.assertEqual(
            set(source.keys()),
            {"id", "name", "url", "is_active", "created_at"},
        )

    def test_creates_source_successfully(self):
        payload = {
            "name": "New source",
            "url": "https://example.com/new-feed.xml",
            "is_active": True,
        }

        response = self.client.post("/api/sources/", payload, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["name"], "New source")
        self.assertEqual(response.data["url"], "https://example.com/new-feed.xml")
        self.assertTrue(response.data["is_active"])
        self.assertIn("id", response.data)
        self.assertIn("created_at", response.data)
        self.assertTrue(
            JobSource.objects.filter(url="https://example.com/new-feed.xml").exists()
        )
        
    def test_rejects_duplicate_source_url(self):
        payload = {
            "name": "Duplicate source",
            "url": self.active_source.url,
            "is_active": True,
        }

        response = self.client.post("/api/sources/", payload, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(JobSource.objects.count(), 2)
    
    def test_rejects_invalid_source_url(self):
        payload = {
            "name": "Invalid source",
            "url": "not-a-valid-url",
            "is_active": True,
        }

        response = self.client.post("/api/sources/", payload, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertFalse(
            JobSource.objects.filter(name="Invalid source").exists()
        )
    
    def test_creates_active_source_by_default(self):
        payload = {
            "name": "Default active source",
            "url": "https://example.com/default-feed.xml",
        }

        response = self.client.post("/api/sources/", payload, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data["is_active"])

class JobSourceDetailViewTests(APITestCase):
    def setUp(self):
        self.source = JobSource.objects.create(
            name="Original source",
            url="https://example.com/feed.xml",
        )
        self.url = reverse(
            "source-detail",
            kwargs={"pk": self.source.pk},
        )

    def test_get_source_returns_source_details(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], str(self.source.id))
        self.assertEqual(response.data["name"], "Original source")
        self.assertEqual(
            response.data["url"],
            "https://example.com/feed.xml",
        )
        self.assertTrue(response.data["is_active"])

    def test_patch_source_name(self):
        response = self.client.patch(
            self.url,
            {"name": "Updated source"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.source.refresh_from_db()
        self.assertEqual(self.source.name, "Updated source")
        self.assertEqual(
            self.source.url,
            "https://example.com/feed.xml",
        )

    def test_patch_source_active_status(self):
        response = self.client.patch(
            self.url,
            {"is_active": False},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.source.refresh_from_db()
        self.assertFalse(self.source.is_active)

    def test_patch_source_with_duplicate_url_returns_400(self):
        JobSource.objects.create(
            name="Another source",
            url="https://another.example.com/feed.xml",
        )

        response = self.client.patch(
            self.url,
            {"url": "https://another.example.com/feed.xml"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.source.refresh_from_db()
        self.assertEqual(
            self.source.url,
            "https://example.com/feed.xml",
        )

    def test_patch_source_with_its_own_url_succeeds(self):
        response = self.client.patch(
            self.url,
            {"url": self.source.url},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_nonexistent_source_returns_404(self):
        nonexistent_url = reverse(
            "source-detail",
            kwargs={"pk": "00000000-0000-0000-0000-000000000000"},
        )

        response = self.client.get(nonexistent_url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
