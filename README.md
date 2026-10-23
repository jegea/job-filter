# Job Filter

A local application for collecting job offers, scoring them against
configurable criteria, and reviewing the most relevant opportunities.

The project is built with Django REST Framework, React, TypeScript,
Vite, and PostgreSQL. The application runs locally through Docker
Compose.

> **Status:** Development project. The configuration described here is
> intended for local development, not production deployment.

## Features

- Fetch job offers from multiple RSS feeds.
- Score offers against keyword-based filtering criteria.
- Automatically reject offers below a minimum score.
- Prevent duplicate offers using normalized URLs.
- Review accepted offers through a web interface.
- Filter offers by review status.
- View global counts of total, pending, and reviewed offers.
- Run automated tests for filtering, ingestion, and API behavior.
- Structured JSON logging for the backend.

## How to use Job Filter

Job Filter collects job offers from RSS feeds, scores them against configurable keyword criteria, and provides an interface to review the results.

The workflow consists of three steps: configure RSS sources, define keyword criteria, and import and review job offers.

### Managing RSS sources

RSS sources are managed through the Django administration interface:

**URL**: http://localhost:8000/admin/

Open the **Job sources** table to manage the available sources. Each source has the following fields:

| Field     | Description                       |
|-----------|-----------------------------------|
| name      | Name used to identify the source. |
| url       | URL of the RSS feed.              |
| is_active | Enables or disables the source.   |

From the administration interface, you can add new sources, edit existing ones, activate or deactivate them, and delete sources that are no longer needed.

Only active sources are considered when importing job offers.

### Managing keywords

Keywords are also managed through **Jobs keywords** table in the Django administration interface.

Each keyword entry has the following fields:

| Field        | Description                                                  |
|--------------|--------------------------------------------------------------|
| term         | Keyword or term to look for in a job offer.                  |
| keyword_type | Either positive or negative.                                 |
| weight       | Numeric value added to or subtracted from the offer’s score (1 to 5). |
| is_active    | Enables or disables the keyword.                             |

Positive keywords increase an offer’s score by their assigned weight when matched. Negative keywords decrease the score by their assigned weight when matched.

The final score is calculated by adding the weights of matching positive keywords and subtracting the weights of matching negative keywords. Only active keywords are considered.

This allows you to adjust the filtering criteria without changing the application code.

### Importing and reviewing job offers

The **Import offers** section of the application retrieves new job offers from the configured RSS sources and applies the keyword-based scoring criteria.

The workflow is as follows:

1. Configure the RSS sources and keywords in Django administration.
2. Open Import offers and run the import.
3. The application fetches new offers from active RSS sources.
4. The offers are evaluated against the active keywords and assigned a score.
5. Offers that meet the minimum score are made available in the job-offer list.
6. Review the resulting offers and mark them as reviewed using the corresponding button.

The minimum score is controlled by `MINIMUM_SCORE` in the backend configuration. Its current value is 5.

Offers below the minimum score are excluded from the relevant results. URL normalization helps prevent duplicate imports of the same offer.

The review status can be used to distinguish offers that still need attention from those that have already been reviewed.

## Tech stack

-   **Backend:** Python 3.13, Django 5.2, Django REST Framework
-   **Database:** PostgreSQL 17
-   **Frontend:** React 19, TypeScript, Vite
-   **Data fetching / UI:** TanStack Query and TanStack Table
-   **Infrastructure:** Docker Compose

## Project structure

``` text
.
├── api/
│   ├── config/             # Django project configuration
│   ├── jobs/               # Job-offer domain, API, ingestion and tests
│   ├── requirements.txt
│   └── Dockerfile
├── web/
│   ├── src/                # React application
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── .env                    # Root / PostgreSQL environment variables
└── README.md
```

Some files and directories may vary as the project evolves.

## Prerequisites

Install the following before starting:

-   Docker Desktop (or Docker Engine with the Docker Compose plugin)
-   Git, if you are cloning the repository

You do not need to install Python, Node.js, or PostgreSQL on the host
machine; these run in containers.

## Environment configuration

Docker Compose expects three environment files:

-   `.env` in the project root
-   `api/.env`
-   `web/.env`

Create these files before starting the containers. Use the values below
for a local development setup.

### Root `.env`

``` dotenv
POSTGRES_DB=project_db
POSTGRES_USER=project_user
POSTGRES_PASSWORD=dev-password-change-me
POSTGRES_PORT=5432
```

### `api/.env`

``` dotenv
DJANGO_SECRET_KEY=dev-only-change-me
DJANGO_DEBUG=1
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,api

DB_HOST=db
DB_PORT=5432
DB_NAME=project_db
DB_USER=project_user
DB_PASSWORD=dev-password-change-me

LOG_LEVEL=INFO
```

### `web/.env`

``` dotenv
VITE_API_URL=http://localhost:8000
```

**Important:** These values are for local development only. Do not use
the example secret key or passwords in a production environment. Keep
the database credentials in the root `.env` and `api/.env` consistent.

## Start the application

Run the following commands from the project root.

### 1. Build and start the containers

``` bash
docker compose up --build -d
```

Docker Compose builds the backend and frontend images and starts the three services:

* db: PostgreSQL database
* api: Django backend
* web: React development server

The backend waits for PostgreSQL to become healthy before starting.

### 2. Apply database migrations

``` bash
docker compose exec api python manage.py migrate
```

This creates or updates the database schema.

### 3. (Optional) Create a Django administrator

``` bash
docker compose exec api python manage.py createsuperuser
```

Follow the prompts to create your administrator account.

You can use this account to access the Django administration interface.

Running the Application

Once the services are running, open the frontend in your browser.

## Access the application

Once the containers are running:

  Component      Local URL
  -------------- ---------------------------------
  Frontend       http://localhost:5173
  Django admin   http://localhost:8000/admin/
  Jobs API       http://localhost:8000/api/jobs/

The frontend uses `VITE_API_URL` to locate the backend API.

The frontend and PostgreSQL ports are bound to the local machine. The Django development server is exposed on port 8000.

## Useful development commands

Run these commands from the project root.

### View container status and logs

``` bash
docker compose ps
docker compose logs -f
docker compose logs -f api
docker compose logs -f web
```

### Run backend tests

``` bash
docker compose exec api python manage.py test
```

The project currently has tests covering scoring and filtering, URL
normalization, publication-date handling, ingestion, and API review
filters.

### Lint the frontend

``` bash
docker compose exec web npm run lint
```

### Build the frontend

``` bash
docker compose exec web npm run build
```

### Stop the application

``` bash
docker compose down
```

This stops and removes the containers while preserving the PostgreSQL
data volume.

### Reset the database

``` bash
docker compose down -v
docker compose up --build -d
docker compose exec api python manage.py migrate
```

**Warning:** `docker compose down -v` deletes the Compose-managed
PostgreSQL volume and therefore removes the database data stored in it.

## Scoring and review workflow

Job offers are scored using keyword-based criteria.

-   `MINIMUM_SCORE` is currently set to `5`.
-   Offers that do not meet the minimum score are excluded from the
    relevant results.
-   URL normalization helps prevent the same offer from being imported
    more than once when it appears under slightly different URL forms.
-   Review status can be filtered using `All`, `Pending`, and
    `Reviewed`.
-   Summary counts reflect the overall set of offers rather than only
    the currently filtered view.

Adjust the scoring criteria and minimum score in the relevant backend
configuration as the project evolves.

## Backend API

The Django URL configuration includes the jobs application under the
`/api/` prefix:

``` python
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("jobs.urls")),
]
```

The jobs API is available at:

``` text
http://localhost:8000/api/jobs/
```

The exact request parameters and response schema are defined by the jobs
application's API implementation.

## Troubleshooting

### A container cannot start because an environment file is missing

Make sure the root `.env`, `api/.env`, and `web/.env` files exist before
running `docker compose up`.

### The API cannot connect to PostgreSQL

Check that:

-   The PostgreSQL service is running: `docker compose ps`.
-   `DB_HOST` is set to `db` in `api/.env`.
-   The database name, username, and password match the values in the
    root `.env`.
-   The database has finished starting before running migrations.

### The frontend cannot reach the API

Check that `VITE_API_URL` is set to `http://localhost:8000` in
`web/.env`, and that the API container is running.

### Changes do not appear in the frontend

Check the frontend logs with `docker compose logs -f web`. If
dependencies or the container configuration have changed, rebuild with:

``` bash
docker compose up --build -d
```

## Development notes

-   Backend dependencies are declared in `api/requirements.txt`.
-   Frontend scripts are defined in `web/package.json`.
-   The frontend build runs TypeScript checks before invoking Vite.
-   Keep secrets and local environment files out of version control when
    appropriate; commit an `.env.example` file instead if you want to
    document required variables safely.
