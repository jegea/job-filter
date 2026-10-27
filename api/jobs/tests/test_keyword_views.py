from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from jobs.models import JobKeyword

class JobKeywordListViewTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.python_keyword = JobKeyword.objects.create(
            term="Python",
            keyword_type=JobKeyword.KeywordType.POSITIVE,
            weight=3,
            is_active=True,
        )

        cls.negative_keyword = JobKeyword.objects.create(
            term="Junior",
            keyword_type=JobKeyword.KeywordType.NEGATIVE,
            weight=2,
            is_active=False,
        )

    def test_returns_all_keywords_including_inactive_ones(self):
        response = self.client.get("/api/keywords/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        returned_ids = {keyword["id"] for keyword in response.data}

        self.assertEqual(
            returned_ids,
            {str(self.python_keyword.id), str(self.negative_keyword.id)},
        )

    def test_returns_keywords_ordered_by_term(self):
        response = self.client.get("/api/keywords/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            [keyword["term"] for keyword in response.data],
            ["Junior", "Python"],
        )

    def test_returns_empty_list_when_no_keywords_exist(self):
        JobKeyword.objects.all().delete()

        response = self.client.get("/api/keywords/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_returns_expected_keyword_fields(self):
        response = self.client.get("/api/keywords/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        keyword = response.data[0]

        self.assertEqual(
            set(keyword.keys()),
            {
                "id",
                "term",
                "keyword_type",
                "weight",
                "is_active",
                "created_at",
                "updated_at",
            },
        )

    def test_creates_keyword_successfully(self):
        payload = {
            "term": "Django",
            "keyword_type": "positive",
            "weight": 4,
            "is_active": True,
        }

        response = self.client.post(
            "/api/keywords/",
            payload,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["term"], "Django")
        self.assertEqual(response.data["keyword_type"], "positive")
        self.assertEqual(response.data["weight"], 4)
        self.assertTrue(response.data["is_active"])
        self.assertIn("id", response.data)
        self.assertIn("created_at", response.data)
        self.assertIn("updated_at", response.data)

        self.assertTrue(
            JobKeyword.objects.filter(term="Django").exists()
        )

    def test_creates_keyword_with_default_values(self):
        payload = {"term": "FastAPI"}

        response = self.client.post(
            "/api/keywords/",
            payload,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["keyword_type"], "positive")
        self.assertEqual(response.data["weight"], 1)
        self.assertTrue(response.data["is_active"])

    def test_rejects_duplicate_keyword_term(self):
        payload = {"term": self.python_keyword.term}

        response = self.client.post(
            "/api/keywords/",
            payload,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(JobKeyword.objects.count(), 2)

    def test_rejects_invalid_keyword_type(self):
        payload = {
            "term": "Ruby",
            "keyword_type": "unknown",
        }

        response = self.client.post(
            "/api/keywords/",
            payload,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(JobKeyword.objects.filter(term="Ruby").exists())

    def test_rejects_invalid_weight(self):
        payload = {
            "term": "Ruby",
            "weight": 6,
        }

        response = self.client.post(
            "/api/keywords/",
            payload,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(JobKeyword.objects.filter(term="Ruby").exists())

class JobKeywordDetailViewTests(APITestCase):
    def setUp(self):
        self.keyword = JobKeyword.objects.create(
            term="Python",
            keyword_type=JobKeyword.KeywordType.POSITIVE,
            weight=3,
            is_active=True,
        )

        self.url = reverse(
            "keyword-detail",
            kwargs={"pk": self.keyword.pk},
        )

    def test_get_keyword_returns_keyword_details(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], str(self.keyword.id))
        self.assertEqual(response.data["term"], "Python")
        self.assertEqual(response.data["keyword_type"], "positive")
        self.assertEqual(response.data["weight"], 3)
        self.assertTrue(response.data["is_active"])

    def test_patch_keyword_term(self):
        response = self.client.patch(
            self.url,
            {"term": "Django"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.keyword.refresh_from_db()
        self.assertEqual(self.keyword.term, "Django")
        self.assertEqual(self.keyword.weight, 3)

    def test_patch_keyword_type_and_weight(self):
        response = self.client.patch(
            self.url,
            {
                "keyword_type": "negative",
                "weight": 5,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.keyword.refresh_from_db()
        self.assertEqual(self.keyword.keyword_type, "negative")
        self.assertEqual(self.keyword.weight, 5)

    def test_patch_keyword_active_status(self):
        response = self.client.patch(
            self.url,
            {"is_active": False},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.keyword.refresh_from_db()
        self.assertFalse(self.keyword.is_active)

    def test_patch_keyword_with_duplicate_term_returns_400(self):
        JobKeyword.objects.create(term="Django")

        response = self.client.patch(
            self.url,
            {"term": "Django"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.keyword.refresh_from_db()
        self.assertEqual(self.keyword.term, "Python")

    def test_patch_keyword_with_its_own_term_succeeds(self):
        response = self.client.patch(
            self.url,
            {"term": self.keyword.term},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_keyword(self):
        response = self.client.delete(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )
        self.assertFalse(
            JobKeyword.objects.filter(pk=self.keyword.pk).exists()
        )

    def test_get_nonexistent_keyword_returns_404(self):
        nonexistent_url = reverse(
            "keyword-detail",
            kwargs={"pk": "00000000-0000-0000-0000-000000000000"},
        )

        response = self.client.get(nonexistent_url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_nonexistent_keyword_returns_404(self):
        nonexistent_url = reverse(
            "keyword-detail",
            kwargs={"pk": "00000000-0000-0000-0000-000000000000"},
        )

        response = self.client.delete(nonexistent_url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)