# capstone-project-team-7-skyroute

## Installing

To install the dependencies needed to run this app, run:

```
sudo apt install docker-compose
sudo apt install npm
```

## Developing

For the first run of the app, run this
```
sudo docker-compose up --build
```

After changes have been made, run these commands
```
sudo docker-compose down
sudo docker-compose up --build
```

If you want to add to the prisma schema run the following commands:
```
npx prisma migrate dev --name init
npx prisma generate
```

## Tests

To test the server-side code, run this command:
```
#testing code here
```
This will run the code using the testing environment.

## Environment file
Create a .env file in the ./apps/server directory

```
DATABASE_URL="postgresql://SkyRouteAdmin:SkyR0uteP@55w0rd@localhost:5432/SkyRoute"
JWT_SECRET="asdf"
JWT_EXPIRES_IN="1h"
```


## Database

Ensure that you have prisma installed globally by running

```
npm install -g prisma
```

To create the database files, you need to run a migration. You can enter this command after the docker container is already running:
```
npx prisma migrate dev --name init
```

To reset the database:
```
npx prisma migrate reset
```
This command will reset the database and erase all previous data.