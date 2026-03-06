# Workforce Management

Web application for employee and shift management with 
messaging between admin and employees.

## Tech Stack

-   Backend: Java, Spring Boot, Spring Security, JPA/Hibernate
-   Frontend: React (Vite)
-   Database: MySQL
-   Authentication: JWT
-   Logging: Logback
-   Containerization: Docker, Docker Compose

## Features

-   JWT authentication
-   Role based access (Admin / Employee)
-   Employee management: create / update / delete / reset password
-   Shift management: create / update / delete shifts, employee calendar
    view, validation rules
-   Messaging system: conversations admin - employee, send messages,
    unread count
-   User profile: update profile, change password
-   Logging of main actions (login, employee actions, shifts, messaging)

## Local Run

Requirements - Java 17 - Maven - Node.js - MySQL

Create database CREATE DATABASE workforce_management;

Configure backend src/main/resources/application.properties

Example:
spring.datasource.url=jdbc:mysql://localhost:3306/workforce_management
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update server.port=8080

Run backend mvn spring-boot:run

Backend URL http://localhost:8080

Run frontend cd frontend npm install npm run dev

Frontend URL http://localhost:3000

## Docker Run

Requirements - Docker - Docker Compose

Check installation docker --version docker compose version

Start application docker compose up -d --build

Access services Frontend: http://localhost:3000, Backend API:http://localhost:8080

Username: workforce Password: workforcepass

Stop containers docker compose down

Delete database data docker compose down -v

Logs docker compose logs -f docker compose logs -f backend docker
compose logs -f db docker compose logs -f frontend

## Default Admin Account

email: admin@gmail.com password: admin123

## Basic Test Flow

-   login as admin
-   create employee
-   logout
-   login as employee
-   change password
-   admin creates shifts
-   employee views shifts
-   test messaging

## Logging

Application uses Logback. Main actions logged: - login attempts -
employee create/update/delete - password changes - shift operations -
messaging events

Logs appear in backend console.

## Project Structure

controller service repository entity dto mapper security config

## Author

Workforce Management System implemented with Spring Boot and React.