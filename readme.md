# Natours

## Introduction

This project was designed for only study purposes.

It was developed and proposed during a NodeJS course created by Jonas Schmedtmann - [Node.js, Express, MongoDB & More: The Complete Bootcamp](https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/).

During and after finishing the course, this project was refined and some adjustments were made.

## Technologies

- Database: Mongoose NoSQL
- Front-end:
    - Code language: Javascript
    - Framework: NodeJS 14.18.1
    - Generated HTML templates using PUG template
- Front-end:
    - Code language: Javascript 
    - Framework: NodeJS 14.18.1

## Environment variables

### Database configs

- MONGO_DB_URI: MongoDB Natours collection URI
- MONGO_DB_USER: MongoDB Natours user
- MONGO_DB_PASS: MongoDB Natours password

### JWT Token configs

- JWT_SECRET: JWT secreted used to sign JWT Token
- JWT_EXPIRES_IN: JWT token lifetime [milliseconds]
- JWT_COOKIES_EXPIRES_IN: Cookie lifetime [milliseconds]

### Mailtrap configs

These parameters values can be found in Mailtrap > My Inbox > SMTP Settings.

- EMAIL_USERNAME: config.action_mailer.smtp_settings.user_name
- EMAIL_PASSWORD: config.action_mailer.smtp_settings.password
- EMAIL_HOST: config.action_mailer.smtp_settings.domain
- EMAIL_PORT: config.action_mailer.smtp_settings.port

### Email messages sender configs

Define the email sender address who warns users through emails.

- EMAIL_FROM: Email sender

### Limit number of calls in a single API

Define the limit number of calls that a single API can make in a period of time.

- LIMITER_MAX_CALLS: Max calls that a single API can make in LIMITER_WINDOW
- LIMITER_WINDOW: Period of time that a single API can make LIMITER_MAX_CALLS calls

### Stripe configs

- STRIPE_SECRET_KEY: Stripe product secret key
- STRIPE_WEBHOOK_SECRET: Stripe webhook endpoint secret

## Creating the database

It was created a [docker-compose file](./docker-compose.yml) to create a MongoDB database for developing purpose.

To create the MongoDB database in a Docker container, use the following command:

```
docker-compose up
```

MongoDB docker-compose configurations:

- MONGO_INITDB_ROOT_USERNAME: root
- MONGO_INITDB_ROOT_PASSWORD: root
- MONGO_INITDB_DATABASE: natours
- ports: 27017:27017

## Setting the database

It was created a node script [import-dev-data.js](./dev-data/data/import-dev-data.js) to import and delete data from database Documents for developing and testing purposes. 

### Importing data

To import a pre-defined document data, use the following command:

```
node import-dev-data.js --import documents=<document_name>
```

Documents valid values: tour; review; user.

If documents isn't provided, all documents pre-defined data will be imported.

Example of importing tour data:

```
node import-dev-data.js --import documents=tour
```

Example of importing all documents data:

```
node import-dev-data.js --import
```

### Deleting data

To delete a pre-defined document data, use the following command:

```
node import-dev-data.js --delete documents=<document_name>
```

Documents valid values: tour; review; user; booking.

If documents isn't provided, all documents pre-defined data will be deleted.

Example of deleting tour data:

```
node import-dev-data.js --delete documents=tour
```

Example of deleting all documents data:

```
node import-dev-data.js --delete
```

## Running the application

### With Docker

### Without Docker

After creating and setting the database, and setting all environment variables in [confing.env](./config.env) file,
use the following command:

```
npm run start:dev
```

## Project