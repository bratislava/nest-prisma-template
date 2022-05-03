# nest-prisma-template

Starting template for nest-prisma development under the city of Bratislava.

# Quick run

If you want to quickly run an application without installing it locally, you can run it trought `docker-compose`:
```bash
$ docker-compose up --build
```

# Local installation

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
$ npx prisma migrate dev --name init
```
This prisma migrate dev command generates SQL files and directly runs them against the database. In this case, the following migration files was created in the existing prisma directory:

## Test

To run tests in the repo plese use these commands:

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```


## Docker


To build image for development run:

```bash
$ docker build --target dev .
```

and for production run:

```bash
$ docker build --target prod .
```

# Deployment
We have multiple options for deploying your app to our kubernetes cluster. 

## Manual
For manual deployment you need to configure some variables which is onetime setup.

### One time setup
We need to configure harbor connection for uploading images to registry.

1. Open our registry website: https://harbor.bratislava.sk
2. Sign in with your azure account
3. Copy CLI secret from your profile. Follow picture guide:

   - Go to your profile on right top corner: 
      ![alt text](./public/readme/user.png)
   - Click on `User Profile`
   - Copy `CLI secret`
   ![alt text](./public/readme/profile.png)
4. Sign in docker with command: 
```bash
$ docker login https://harbor.bratislava.sk
```
 using you username `your.name@bratislava.sk` and `CLI secret` value
5. When you see `Login Succeeded` then you are done 👏  

### Prepare image
If you are authetificated in docker registry, we can continue with image preparation.
Based on your preference you can decide which image you would like ot build (dev or production).

```bash
$ docker build -t harbor.bratislava.sk/standalone/nest-prisma-template:1.0 --target prod . 
```

Push image to harbor

```bash
$ docker push harbor.bratislava.sk/standalone/nest-prisma-template:1.0
```

### Prepare Kustomize file

If you don`t have Kustomize, please install it:

```bash
$ brew install kustomize
```

```bash
 kustomize build --load-restrictor LoadRestrictionsNone kubernetes/envs/Dev | envsubst > manifest.yml
```


## Pipelines

### Kustomize

### Secrets
Lets have a look if you are in proper cluster:

```bash
$ kubectl config current-context
```

We are using for secrets `Sealed Secrets` https://github.com/bitnami-labs/sealed-secrets.
To use a secret in you project you have to install `kubeseal` if you haven`t installed yet.

```bash
$ brew install kubeseal
```
The next thing is going to folder `secrets` where all our secrets are stored:

```bash
$ cd kubernetes/base/secrets
```

Afther that we need to create temp file for our new secrets. Lets assume we want database connection secretes. You need to create this file `database.yml`

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: database-secret
data:
  POSTGRES_DB: YmFuYW5h
  POSTGRES_USER: YmFuYW5h
  POSTGRES_PASSWORD: YmFuYW5h
```

- `metadata.name` is name of the group of secrets in our case `database-secret`

- `data` contains enviroment variables keys (`POSTGRES_DB`) together with base64 encode values (`YmFuYW5h`).

For example if you need to set up database name to `banana` you need to base64 encode this value. You can use online base64 converter like https://www.base64encode.org and encode `banana` to `YmFuYW5h`.


The last thing is encrypting our secrets by kubeseal that they can be used on kubernetes. For that you need to run this command which creates file `database.secret.yml` where are all our values encrypted and it is safe to add to repository.
```bash
$ kubeseal --controller-name=sealed-secrets --scope=namespace-wide --namespace=standalone --format=yaml < database.yml > database.secret.yml 
```

If you want to propagate selaed secret to kubernetes without pipeline you can run this command:
```bash
$ kubectl create -f database.secret.yml
```

If you already has sealed secret in kubernetes you can updated it with command:
```bash
$ kubectl apply -f database.secret.yml
```
Usually you get this kind of error: `Error from server (AlreadyExists): error when creating "database.secret.yml": sealedsecrets.bitnami.com "nest-prisma-template-database-secret" already exists`

If you want to check if you secret is there, you can run this command:
```bash
$ kubectl get secret --namespace=standalone nest-prisma-template-database-secret
```


#### Database convention naming

In our services please use as database name and user the project slug. In this case we will use `nest-prisma-template`. And for password use atleast 16 character long pass with random chars.
```yml
POSTGRES_DB: nest-prisma-template
POSTGRES_USER: nest-prisma-template
POSTGRES_PASSWORD: LBcdso08b&aasd(ck2*d!p
```

which after base64 encoding looks like this:

```yml
POSTGRES_DB: bmVzdC1wcmlzbWEtdGVtcGxhdGU=
POSTGRES_USER: bmVzdC1wcmlzbWEtdGVtcGxhdGU=
POSTGRES_PASSWORD: TEJjZHNvMDhiJmFhc2QoY2syKmQhcA==
```


## Stay in touch

- Website - [https://inovacie.bratislava.sk/](https://inovacie.bratislava.sk/)

##
