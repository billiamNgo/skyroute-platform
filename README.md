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

If you want to add to the prisma schema rebuild the containter.


## Tests

### Backend Tests
To test the server-side code, run this command:
```
cd apps/server
npx prisma generate
npm test
```
This will run the code using the testing environment.

### End-to-End Tests
To start Cypress to run end-to-end tests

Start the server first (Refer to the 'Developing' section)

In another terminal run these commands:
```
cd apps/client 
npm install
npx cypress open
```
Cypress has dependencies for running on Linux depending on your version if an error is encountered when trying to open Cypress refer to this
https://docs.cypress.io/app/get-started/install-cypress#Linux-Prerequisites

## Environment file
Create a .env file in the ./apps/server directory

```
DATABASE_URL="postgresql://SkyRouteAdmin:SkyR0uteP@55w0rd@db:5432/SkyRoute"
JWT_SECRET="asdf"
JWT_EXPIRES_IN="1h"
```


## Database

Ensure that you have prisma installed globally by running

```
npm install -g prisma
```

The database files are migrated automatically.

To reset the database:
```
npx prisma migrate reset
```
This command will reset the database and erase all previous data.

## Video Demonstration
Development Checkpoint 1 Demo Video:
```
https://www.loom.com/share/33586033103142e0b117cd95e669bae1
```
Development Checkpoint 2 Demo Video:
```
https://drive.google.com/file/d/1BTRljRbTGgiH9rrAVyBe-ALypK0dl1Em/view?usp=sharing
```
Technical Documentation Video: 
```
https://drive.google.com/file/d/1kSIEa2Upg3aH6rNtSOAM5hkwb90Dzw0m/view?usp=sharing
```
User Documentation Video:
```
https://drive.google.com/file/d/1nLAiQpSQxuMVn8SOaAPiZwviO4dFopMj/view?usp=sharing
```

