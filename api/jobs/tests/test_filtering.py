from django.test import TestCase

from jobs.filtering import score_job
from jobs.models import JobKeyword

class ScoreJobTests(TestCase):
    def setUp(self):
        self.python_keyword = JobKeyword.objects.create(
            term="Python",
            keyword_type=JobKeyword.KeywordType.POSITIVE,
            weight=5,
            is_active=True,
        )

    def test_positive_keyword_in_title_increases_score(self):
        result = score_job(
            title="Senior Python Developer",
            description="Join our engineering team.",
        )

        self.assertEqual(result["score"], 5)
        self.assertEqual(len(result["matches"]), 1)

        self.assertEqual(
            result["matches"][0]["fields"],
            ["title"],
        )

    def test_keyword_matching_is_case_insensitive(self):
        result = score_job(
            title="SENIOR PYTHON DEVELOPER",
            description="",
        )

        self.assertEqual(result["score"], 5)
        self.assertEqual(len(result["matches"]), 1)

    def test_keyword_must_match_a_complete_word(self):
        result = score_job(
            title="Experienced Pythonista",
            description="",
        )

        self.assertEqual(result["score"], 0)
        self.assertEqual(result["matches"], [])

    def test_keyword_can_match_in_description(self):
        result = score_job(
            title="Software Developer",
            description="Experience with Python is required.",
        )
        
        self.assertEqual(result["score"], 5)
        self.assertEqual(
            result["matches"][0]["fields"],
            ["description"],
        )

    def test_same_keyword_in_both_fields_is_scored_only_once(self):
        result = score_job(
            title="Python Developer",
            description="Experience with Python is required.",
        )

        self.assertEqual(result["score"], 5)
        self.assertEqual(
            result["matches"][0]["fields"],
            ["title", "description"],
        )

    def test_inactive_keyword_is_ignored(self):
        self.python_keyword.is_active = False
        self.python_keyword.save(update_fields=["is_active"])
        result = score_job(
            title="Python Developer",
            description="",
        )

        self.assertEqual(result["score"], 0)
        self.assertEqual(result["matches"], [])

    def test_negative_keyword_decreases_score(self):
        JobKeyword.objects.create(
            term="WordPress",
            keyword_type=JobKeyword.KeywordType.NEGATIVE,
            weight=3,
            is_active=True,
        )

        result = score_job(
            title="Python and WordPress Developer",
            description="",
        )

        self.assertEqual(result["score"], 2)
        self.assertEqual(len(result["matches"]), 2)

        negative_match = next(
            match
            for match in result["matches"]
            if match["term"] == "WordPress"
        )

        self.assertEqual(negative_match["weight"], 3)
        self.assertEqual(negative_match["score"], -3)

    def test_empty_title_and_description_return_zero_score(self):
        result = score_job(
            title="",
            description="",
        )
        self.assertEqual(result["score"], 0)
        self.assertEqual(result["matches"], [])

    def test_no_active_keywords_returns_zero_score(self):
        self.python_keyword.is_active = False
        self.python_keyword.save(update_fields=["is_active"])

        result = score_job(
            title="Python Developer",
            description="Experience with Python.",
        )

        self.assertEqual(result["score"], 0)
        self.assertEqual(result["matches"], [])