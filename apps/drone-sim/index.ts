import { io, Socket } from 'socket.io-client';
import 'dotenv/config';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:8080';
const DRONE_ID = Number(process.env.SIM_DRONE_ID) || 1;
const PHARMACY_ID = Number(process.env.SIM_PHARMACY_ID) || 1;

console.log(`Starting Drone Simulator for Drone ID: ${DRONE_ID}, Pharmacy ID: ${PHARMACY_ID}`);

const socket: Socket = io(SERVER_URL);

let isBusy = false;

socket.on('connect', () => {
    console.log(`Connected to SkyRoute server at ${SERVER_URL}`);
    console.log(`Joining pharmacy room: pharmacy_${PHARMACY_ID}`);
    socket.emit('join:pharmacy', PHARMACY_ID);
});

socket.on('order:assigned', async (data: { orderId: number; droneId: number; pharmacyId: number }) => {
    if (data.droneId !== DRONE_ID || isBusy) return;

    console.log(`Mission received: Order ${data.orderId} assigned!`);
    isBusy = true;

    // Simulate Mission
    await runMission(data.orderId);

    console.log(`Mission complete: Order ${data.orderId} delivered.`);
    isBusy = false;

    // Report status back to server as IDLE
    socket.emit('drone:statusUpdate', {
        droneId: DRONE_ID,
        status: 'IDLE'
    });
});

async function runMission(orderId: number) {
    // Start coordinates (mocking a pharmacy location)
    let lat = 30.4383 + (Math.random() - 0.5) * 0.01;
    let lon = -84.2807 + (Math.random() - 0.5) * 0.01;

    const steps = 10;
    const latStep = 0.001; // Mock movement
    const lonStep = 0.001;

    for (let i = 0; i <= steps; i++) {
        console.log(`Order ${orderId}: Telemetry update - Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`);
        
        socket.emit('drone:telemetry', {
            droneId: DRONE_ID,
            pharmacyId: PHARMACY_ID,
            latitude: lat,
            longitude: lon
        });

        lat += latStep;
        lon += lonStep;

        // Wait 1 second between updates
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

socket.on('error', (error) => {
    console.error('Socket error:', error);
});
