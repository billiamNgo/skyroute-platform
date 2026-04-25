type Drone = {
  droneID: number;
  pharmacyID: number;
  currentStatus: string;
};

// Vite exposes env via import.meta.env; in TypeScript that may not include custom fields,
// fall back to a runtime default if undefined.
const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function buildHeaders(): Record<string, string> {
  return { 'Content-Type': 'application/json', ...getAuthHeader() };
}

export async function getDrones(): Promise<Drone[]> {
  const res = await fetch(`${API_BASE}/drones`, {
    headers: buildHeaders(),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch drones');
  return data as Drone[];
}

export async function getDroneTracking(droneId: number) {
  const res = await fetch(`${API_BASE}/drones/${droneId}/track`, {
    headers: buildHeaders(),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch tracking data');
  return data;
}

export async function updateDroneStatus(droneId: number, status: string) {
  const res = await fetch(`${API_BASE}/drones/${droneId}/status`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ status }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update drone status');
  return data;
}

export type { Drone };
