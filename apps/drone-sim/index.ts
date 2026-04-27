import { io, Socket } from 'socket.io-client';
import 'dotenv/config';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:8080';
const DRONE_ID = Number(process.env.SIM_DRONE_ID) || 1;
const PHARMACY_ID = Number(process.env.SIM_PHARMACY_ID) || 1;
const USER_EMAIL = process.env.SIM_USER_EMAIL || `service@pharmacy${PHARMACY_ID}.com`;
const USER_PASSWORD = process.env.SIM_USER_PASSWORD || 'ChangeMe!23';

console.log(`Starting Drone Simulator for Drone ID: ${DRONE_ID}, Pharmacy ID: ${PHARMACY_ID}`);

async function login() {
    console.log(`Authenticating with server at ${SERVER_URL}/auth/login...`);
    try {
        const response = await fetch(`${SERVER_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: USER_EMAIL,
                password: USER_PASSWORD
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        const data = await response.json();
        console.log(`Authenticated successfully as ${USER_EMAIL}`);
        return data.token;
    } catch (error: any) {
        console.error('Failed to authenticate:', error.message);
        return null;
    }
}

async function start() {
    const token = await login();
    if (!token) {
        console.error('Could not obtain authentication token. Exiting.');
        process.exit(1);
    }

    const socket: Socket = io(SERVER_URL, {
        auth: { token }
    });

    let isBusy = false;

    socket.on('connect', () => {
        console.log(`Connected to SkyRoute server at ${SERVER_URL}`);
        console.log(`Joining pharmacy room: pharmacy_${PHARMACY_ID}`);
        socket.emit('join:pharmacy', PHARMACY_ID);
    });

    socket.on('connect_error', (error) => {
        console.error('Connection error:', error.message);
        if (error.message.includes('Authentication error')) {
            console.log('Token might be expired. Retrying login...');
        }
    });

    socket.on('order:assigned', async (data: any) => {
        // data should be of type DroneDelivery
        if (data.droneId !== DRONE_ID || isBusy) return;

        console.log(`Mission received: Order ${data.orderId} assigned!`);
        console.log(`Target Location: ${data.destinationLat}, ${data.destinationLon}`);
        isBusy = true;

        // Immediately update drone status to IN_TRANSIT now that we have geodata
        socket.emit('drone:statusUpdate', {
            droneId: DRONE_ID,
            orderId: data.orderId,
            status: 'IN_TRANSIT'
        });

        // Simulate Mission
        await runMission(socket, data);

        isBusy = false;

        // Report status back to server as IDLE and mission complete
        socket.emit('drone:statusUpdate', {
            droneId: DRONE_ID,
            status: 'IDLE'
        });
        console.log(`Mission complete: Drone returned to pharmacy.`);
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
}

// Maintain global battery state for this drone instance
let currentBatteryLevel = 100;

async function runMission(socket: Socket, mission: any) {
    const { orderId, originLat, originLon, destinationLat, destinationLon } = mission;

    // Calculate straight-line distance in degrees
    const deltaLat = destinationLat - originLat;
    const deltaLon = destinationLon - originLon;
    const distanceDegrees = Math.sqrt(deltaLat * deltaLat + deltaLon * deltaLon);
    
    // Speed: ~0.0025 degrees per 15-second update (roughly 277 meters per 15s = ~41 mph)
    const SPEED_DEGREES_PER_STEP = 0.0025;
    const BATTERY_DRAIN_PER_STEP = 0.5; // 0.5% drain per 15 seconds
    
    // Calculate dynamic steps based on actual distance (minimum 1 step)
    const steps = Math.max(1, Math.ceil(distanceDegrees / SPEED_DEGREES_PER_STEP));

    // ----- Phase 1: Outbound to Destination -----
    console.log(`Phase 1: Outbound to delivery address... (${steps} updates estimated)`);
    let latStep = deltaLat / steps;
    let lonStep = deltaLon / steps;
    let currentLat = originLat;
    let currentLon = originLon;

    for (let i = 1; i <= steps; i++) {
        currentLat += latStep;
        currentLon += lonStep;
        currentBatteryLevel = Math.max(0, currentBatteryLevel - BATTERY_DRAIN_PER_STEP);
        
        console.log(`Order ${orderId}: Telemetry - Lat: ${currentLat.toFixed(6)}, Lon: ${currentLon.toFixed(6)} | Battery: ${currentBatteryLevel.toFixed(1)}% (${i}/${steps})`);
        
        socket.emit('drone:telemetry', {
            droneId: DRONE_ID,
            pharmacyId: PHARMACY_ID,
            latitude: currentLat,
            longitude: currentLon,
            batteryLevel: Math.round(currentBatteryLevel)
        });
        await new Promise(resolve => setTimeout(resolve, 15000));
    }

    console.log(`Order ${orderId} arrived at destination. Marking as DELIVERED.`);
    socket.emit('drone:statusUpdate', {
        droneId: DRONE_ID,
        orderId: orderId,
        status: 'DELIVERED'
    });

    // ----- Phase 2: Inbound to Pharmacy -----
    console.log(`Phase 2: Inbound - Returning to pharmacy... (${steps} updates estimated)`);
    // Reverse the step directions
    latStep = -latStep;
    lonStep = -lonStep;

    for (let i = 1; i <= steps; i++) {
        currentLat += latStep;
        currentLon += lonStep;
        currentBatteryLevel = Math.max(0, currentBatteryLevel - BATTERY_DRAIN_PER_STEP);
        
        console.log(`Order ${orderId}: Telemetry - Lat: ${currentLat.toFixed(6)}, Lon: ${currentLon.toFixed(6)} | Battery: ${currentBatteryLevel.toFixed(1)}% (${i}/${steps})`);
        
        socket.emit('drone:telemetry', {
            droneId: DRONE_ID,
            pharmacyId: PHARMACY_ID,
            latitude: currentLat,
            longitude: currentLon,
            batteryLevel: Math.round(currentBatteryLevel)
        });
        await new Promise(resolve => setTimeout(resolve, 15000));
    }
}

// Start the simulator
start().catch(err => {
    console.error('Unhandled initialization error:', err);
    process.exit(1);
});

