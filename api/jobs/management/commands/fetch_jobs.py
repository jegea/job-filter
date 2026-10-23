from django.core.management.base import BaseCommand

from jobs.services.job_ingestion import ingest_jobs


class Command(BaseCommand):
    help = "Fetch, filter and save job listings from active sources."

    def handle(self, *args, **options):
        self.stdout.write("Fetching jobs from active sources...")
        summary = ingest_jobs()
        if summary["sources_processed"] == 0:
            self.stdout.write(
                self.style.WARNING("No active job sources found.")
            )
            return
        for source_error in summary["source_errors"]:
            self.stderr.write(
                self.style.ERROR(
                    f"Error processing {source_error['source']}: "
                    f"{source_error['error']}"
                )
            )
        self.stdout.write("\n" + "-" * 40)
        self.stdout.write(
            f"Sources processed: {summary['sources_processed']}"
        )
        self.stdout.write(
            f"Entries found: {summary['entries_found']}"
        )
        self.stdout.write(
            f"Entries accepted by filter: {summary['accepted_entries']}"
        )
        self.stdout.write(f"Jobs saved: {summary['saved_jobs']}")
        self.stdout.write(f"Duplicates skipped: {summary['duplicates']}")
        self.stdout.write(
            f"Entries rejected: {summary['rejected_entries']}"
        )
        self.stdout.write(f"Source errors: {summary['errors']}")
        if summary["errors"]:
            self.stdout.write(
                self.style.WARNING("Finished with errors.")
            )
        else:
            self.stdout.write(
                self.style.SUCCESS("Finished fetching jobs.")
            )