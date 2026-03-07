-- CreateTable
CREATE TABLE "User" (
    "userID" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userID")
);

-- CreateTable
CREATE TABLE "Pharmacies" (
    "pharmacyID" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" INTEGER NOT NULL,

    CONSTRAINT "Pharmacies_pkey" PRIMARY KEY ("pharmacyID")
);

-- CreateTable
CREATE TABLE "APIKeys" (
    "keyID" SERIAL NOT NULL,
    "keyHash" TEXT NOT NULL,
    "pharmacyID" INTEGER NOT NULL,
    "creationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expirationDate" TIMESTAMP(3) NOT NULL DEFAULT NOW() + interval '1 year',

    CONSTRAINT "APIKeys_pkey" PRIMARY KEY ("keyID")
);

-- CreateTable
CREATE TABLE "Drones" (
    "droneID" SERIAL NOT NULL,
    "pharmacyID" INTEGER NOT NULL,
    "currentStatus" TEXT NOT NULL DEFAULT 'IDLE',
    "batteryLevel" INTEGER NOT NULL,

    CONSTRAINT "Drones_pkey" PRIMARY KEY ("droneID")
);

-- CreateTable
CREATE TABLE "Orders" (
    "orderID" SERIAL NOT NULL,
    "pharmacyID" INTEGER NOT NULL,
    "droneID" INTEGER,
    "customerFirstName" TEXT NOT NULL,
    "customerLastName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "medicationName" TEXT NOT NULL,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("orderID")
);

-- CreateTable
CREATE TABLE "DroneLocation" (
    "locationID" SERIAL NOT NULL,
    "droneID" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DroneLocation_pkey" PRIMARY KEY ("locationID")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "APIKeys_keyHash_key" ON "APIKeys"("keyHash");

-- AddForeignKey
ALTER TABLE "APIKeys" ADD CONSTRAINT "APIKeys_pharmacyID_fkey" FOREIGN KEY ("pharmacyID") REFERENCES "Pharmacies"("pharmacyID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Drones" ADD CONSTRAINT "Drones_pharmacyID_fkey" FOREIGN KEY ("pharmacyID") REFERENCES "Pharmacies"("pharmacyID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_pharmacyID_fkey" FOREIGN KEY ("pharmacyID") REFERENCES "Pharmacies"("pharmacyID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_droneID_fkey" FOREIGN KEY ("droneID") REFERENCES "Drones"("droneID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DroneLocation" ADD CONSTRAINT "DroneLocation_droneID_fkey" FOREIGN KEY ("droneID") REFERENCES "Drones"("droneID") ON DELETE CASCADE ON UPDATE CASCADE;
