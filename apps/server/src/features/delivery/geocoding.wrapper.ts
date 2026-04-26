import NodeGeocoder, { Options } from 'node-geocoder';

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export class GeocodingWrapper {
    private geocoder: NodeGeocoder.Geocoder;

    constructor() {
        const options: Options = {
            provider: 'openstreetmap',
            formatter: null,
            email: 'service@skyroute.com'
        };

        this.geocoder = NodeGeocoder(options);
    }

    public async geocode(address: string, city: string, state: string): Promise<Coordinates> {
        // Construct a full address string
        const fullAddress = `${address}, ${city}, ${state}`;
        console.log(`[GeocodingWrapper] Querying OpenStreetMap API for: ${fullAddress}`);
        
        try {
            const results = await this.geocoder.geocode(fullAddress);

            if (results && results.length > 0) {
                const firstResult = results[0];
                if (firstResult.latitude && firstResult.longitude) {
                    console.log(`[GeocodingWrapper] Success! Resolved to ${firstResult.latitude}, ${firstResult.longitude}`);
                    return {
                        latitude: firstResult.latitude,
                        longitude: firstResult.longitude
                    };
                }
            }

            console.warn(`[GeocodingWrapper] No results found for ${fullAddress}. Using fallback.`);
            return this.getFallbackCoordinates();

        } catch (error) {
            console.error(`[GeocodingWrapper] Geocoding API failed:`, error);
            return this.getFallbackCoordinates();
        }
    }

    private getFallbackCoordinates(): Coordinates {
        // Center of Pensacola area fallback so the simulator doesn't crash on API failure
        return {
            latitude: 30.4213,
            longitude: -87.2169
        };
    }
}
