export interface Coordinates {
    latitude: number;
    longitude: number;
}

export class GeocodingService {
    // A simple mock geocoding map based on our seeded addresses
    private mockMap: Record<string, Coordinates> = {
        '5634 Woodbine Rd': { latitude: 30.6045, longitude: -87.1605 },
        '5400 Berryhill Rd': { latitude: 30.6120, longitude: -87.1550 },
        '4400 Bayou Blvd': { latitude: 30.4754, longitude: -87.2023 },
        '1000 College Blvd': { latitude: 30.4810, longitude: -87.2150 },
        '3900 Hwy 90': { latitude: 30.5995, longitude: -87.1610 },
        '4000 Hwy 90': { latitude: 30.6000, longitude: -87.1600 },
        '6000 N 9th Ave': { latitude: 30.4850, longitude: -87.1980 },
        '6500 N 9th Ave': { latitude: 30.4920, longitude: -87.1950 },
        '6200 N 9th Ave': { latitude: 30.4870, longitude: -87.1970 },
    };

    public async geocode(address: string, city: string, state: string): Promise<Coordinates> {
        console.log(`Geocoding address: ${address}, ${city}, ${state}`);
        
        // Find by address (simple lookup for this mock)
        const coords = this.mockMap[address];
        
        if (coords) {
            return coords;
        }

        // Fallback: Default to center of Pensacola area if not found
        console.warn(`Address not found in geocoding mock: ${address}. Using fallback.`);
        return {
            latitude: 30.4213,
            longitude: -87.2169
        };
    }
}
