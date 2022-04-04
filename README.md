# Personal APP API 💪

## Description

API for personal trainer and students application

## Installation ⚙

````bash
$ npm

## Description

API for personal trainer and students application

## Installation

```bash
$ npm install
````

## Running the app 🚀

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test ✅

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Redis Docker for email queue 🔗

```bash
docker run -d -p 6379:6379 -i --name redis -t redis:6.2.6-alpine
```

## Docker - DataBase (Postgres) 🔗

```bash
docker run -d -p 5432:5432 --name db-personal-app -e POSTGRES_PASSWORD=personal postgres
```

### link to acess Bull Dashboard
http://localhost:3001/admin/queues
