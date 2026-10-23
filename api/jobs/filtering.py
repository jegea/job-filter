import re

from jobs.models import JobKeyword


def score_job(title: str, description: str) -> dict:
    """Score a job using the active keyword rules."""
    text_by_field = {
        "title": title or "",
        "description": description or "",
    }

    matches = []
    score = 0

    keywords = JobKeyword.objects.filter(is_active=True)

    for keyword in keywords:
        escaped_term = re.escape(keyword.term)

        pattern = re.compile(
            rf"(?<!\w){escaped_term}(?!\w)",
            re.IGNORECASE,
        )

        matched_fields = [
            field
            for field, text in text_by_field.items()
            if pattern.search(text)
        ]

        if not matched_fields:
            continue

        weight = keyword.weight

        if keyword.keyword_type == JobKeyword.KeywordType.NEGATIVE:
            weight = -weight

        score += weight

        matches.append(
            {
                "term": keyword.term,
                "type": keyword.keyword_type,
                "weight": keyword.weight,
                "score": weight,
                "fields": matched_fields,
            }
        )

    return {
        "score": score,
        "matches": matches,
    }