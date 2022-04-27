# nest-prisma-template

Starting template for nest-prisma development under the city of Bratislava.

## Quick run

If you want to quickly run an application without installing it locally, you can run it trought `docker-compose`:
```bash
$ docker-compose up --build
```





## Local installation

- Run npm installation for dependencies

```bash
$ npm install
```

- For prisma it comes handy to have prisma cli. Check it if it is working on your pc:

```bash
$ npx prisma
```

- Check `.env` file for your correct local database connection configuration. It looks like this:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydatabase?schema=public"`
```

If you have issues connecting to your postgres, maybe you need to set timeout `connect_timeout`. Sometimes macs has problems with that:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/?connect_timeout=30&schema=public"
```

- (Optional) To initialize prisma for the first time you can run:
(but it deletes old prisma schema if it is available there)

```bash
$ prisma init
```




## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Prisma
If you have some change in schema.prisma, run:

```bash
$ npx prisma db push
```
This will update the structure. But if you have some existing data in db you need to create migrations to properly propagate changes.

```bash
npx prisma migrate dev --name init
```
This prisma migrate dev command generates SQL files and directly runs them against the database. In this case, the following migration files was created in the existing prisma directory:


## Docker


To build image for development run:

```bash
$ docker build --target dev .
```

and for production run:

```bash
$ docker build --target prod .
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

This repo is an MIT-licensed open source projectvwnd is [MIT licensed](LICENSE).

## Stay in touch

- Website - [https://inovacie.bratislava.sk/](https://inovacie.bratislava.sk/)

##
