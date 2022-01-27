# Uptime Monitoring API Server
The main idea of the task is to build an uptime monitoring RESTful API server which allows authorized users to enter URLs they want monitored, and get detailed uptime reports about their availability, average response time, and total uptime/downtime.

## Features:
* Sign-up with email verification.
* Stateless authentication using JWT.
* Users can create a check to monitor a given URL if it is up or down.
* Users can edit or delete their checks if needed.
* Users can get detailed uptime reports about their checks availability, average response time, and total uptime/downtime.
* Users can group their checks by tags and get reports by tag.

## Database:
* MongoDB is used in this project
* 3 Collections are created (Users - Checks - Reports)
* Collections are to be created on running the nodejs application by just changing the DB_String

## Swagger UI:
* A json file contains the APIs required for testing the task
* Don't forget to run these commands before trying: npm i swagger-ui-express

To view the swagger document go for:
 http://localhost:5000/api-docs/

