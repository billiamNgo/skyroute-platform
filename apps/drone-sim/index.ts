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

    socket.on('order:assigned', async (data: { 
        orderId: number; 
        droneId: number; 
        pharmacyId: number;
        orderLat?: number; 
        orderLon?: number;
        pharmacyLat?: number;
        pharmacyLon?: number;
    }) => {
        if (data.droneId !== DRONE_ID || isBusy) return;

        console.log(`Mission received: Order ${data.orderId} assigned!`);
        console.log(`Target Location: ${data.orderLat}, ${data.orderLon}`);
        
        isBusy = true;

        // Default to current Tallahassee mock if coordinates are missing (safety fallback)
        const startLat = data.pharmacyLat || 30.4383;
        const startLon = data.pharmacyLon || -84.2807;
        const destLat = data.orderLat || (startLat + 0.01);
        const destLon = data.orderLon || (startLon + 0.01);

        // Simulate Mission: Phase 1 - Outbound
        console.log(`Phase 1: Outbound to delivery address...`);
        await runFlight(socket, data.orderId, startLat, startLon, destLat, destLon);

        console.log(`Order ${data.orderId} arrived at destination. Marking as DELIVERED.`);
        
        // Report delivery complete (this sets order status to DELIVERED and drone status to IDLE on server temporarily)
        socket.emit('drone:statusUpdate', {
            droneId: DRONE_ID,
            orderId: data.orderId,
            status: 'IDLE' // This triggers the server's DELIVERED logic
        });

        // Immediately update drone back to IN_TRANSIT for the return trip
        socket.emit('drone:statusUpdate', {
            droneId: DRONE_ID,
            status: 'IN_TRANSIT'
        });

        // Phase 2: Inbound - Return to Pharmacy
        console.log(`Phase 2: Inbound - Returning to pharmacy...`);
        await runFlight(socket, data.orderId, destLat, destLon, startLat, startLon);

        console.log(`Mission complete: Drone returned to pharmacy.`);
        isBusy = false;

        // Final status update to IDLE
        socket.emit('drone:statusUpdate', {
            droneId: DRONE_ID,
            status: 'IDLE'
        });
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
}

async function runFlight(
    socket: Socket, 
    orderId: number, 
    startLat: number, 
    startLon: number, 
    endLat: number, 
    endLon: number
) {
    const steps = 5; // Use fewer steps for demo speed, or more for realism
    
    for (let i = 1; i <= steps; i++) {
        // Linear interpolation
        const lat = startLat + (endLat - startLat) * (i / steps);
        const lon = startLon + (endLon - startLon) * (i / steps);

        console.log(`Order ${orderId}: Telemetry update - Lat: ${lat.toFixed(6)}, Lon: ${lon.toFixed(6)} (${i}/${steps})`);
        
        socket.emit('drone:telemetry', {
            droneId: DRONE_ID,
            pharmacyId: PHARMACY_ID,
            latitude: lat,
            longitude: lon
        });

        // Wait between updates (reduced for demo purposes)
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}

// Start the simulator
start().catch(err => {
    console.error('Unhandled initialization error:', err);
    process.exit(1);
});

