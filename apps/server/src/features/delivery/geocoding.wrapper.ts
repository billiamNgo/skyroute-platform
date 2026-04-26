export interface Coordinates {
    latitude: number;
    longitude: number;
}

export class GeocodingWrapper {
    // A simple mock geocoding map based on our seeded addresses
    // Ready to be replaced by node-geocoder or Axios in the future
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
        // Pharmacies
        '5580 Woodbine Rd': { latitude: 30.6399, longitude: -87.1801 }, // Publix
        '4711 Bayou Blvd': { latitude: 30.4684, longitude: -87.2089 }, // CVS
        '6314 N Ninth Ave': { latitude: 30.4888, longitude: -87.1964 }, // Walgreens
    };

    public async geocode(address: string, city: string, state: string): Promise<Coordinates> {
        console.log(`[GeocodingWrapper] Resolving address: ${address}, ${city}, ${state}`);
        
        // Simulate network latency of a real API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const coords = this.mockMap[address];
        
        if (coords) {
            return coords;
        }

        console.warn(`[GeocodingWrapper] Address not found in geocoding mock: ${address}. Using fallback.`);
        return {
            latitude: 30.4213,
            longitude: -87.2169
        };
    }
}
