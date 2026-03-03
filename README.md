# Workforce Management

## Running the Application with Docker

### Overview

The application is fully containerized using Docker and orchestrated
with Docker Compose.\
It consists of the following services:

-   MySQL 8 (Database)
-   Spring Boot (Java 17) Backend
-   React (Vite) Frontend served via Nginx

All services are defined in the `docker-compose.yml` file and
communicate through an isolated Docker network.

------------------------------------------------------------------------

## Prerequisites

-   Docker Desktop (Windows/macOS) or Docker Engine (Linux)
-   Docker Compose (included in Docker Desktop)

Verify installation:

docker --version docker compose version

------------------------------------------------------------------------

## Build and Start the Application

From the project root directory (where `docker-compose.yml` is located),
execute:

docker compose up -d --build

This command:

-   Builds the backend Docker image
-   Builds the frontend Docker image
-   Pulls and initializes the MySQL 8 image
-   Creates the required Docker network and persistent volume
-   Starts all containers in detached mode

------------------------------------------------------------------------

## Accessing the Application

After successful startup:

Frontend: http://localhost:3000

Backend API: http://localhost:8080

MySQL (for external tools such as MySQL Workbench):

Host: localhost\
Port: 3307\
Database: workforce\
Username: workforce\
Password: workforcepass

------------------------------------------------------------------------

## Stopping the Application

To stop all running services:

docker compose down

To stop and remove the database volume (this deletes all stored data):

docker compose down -v

------------------------------------------------------------------------

## Viewing Logs

All services:

docker compose logs -f

Specific service:

docker compose logs -f backend docker compose logs -f db docker compose
logs -f frontend

------------------------------------------------------------------------

## Restarting a Service

Example:

docker compose restart backend

------------------------------------------------------------------------

## Rebuilding a Specific Service

Example:

docker compose build backend docker compose up -d

------------------------------------------------------------------------

## Architecture Notes

-   The backend connects to MySQL using the internal Docker hostname
    `db` on port `3306`.
-   The external port mapping `3307:3306` is intended only for
    development access from the host machine.
-   Application configuration is injected via environment variables
    defined in `docker-compose.yml`.
-   MySQL data is persisted using a Docker volume to ensure durability
    between container restarts.
