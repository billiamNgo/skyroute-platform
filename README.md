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
```


## Database
```
#database commands here
```