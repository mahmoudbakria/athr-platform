// City Coordinates Fallback (Approximate)
export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
    "Nazareth": { lat: 32.6996, lng: 35.3035 },
    "Haifa": { lat: 32.7940, lng: 34.9896 },
    "Jerusalem": { lat: 31.7683, lng: 35.2137 },
    "Tel Aviv": { lat: 32.0853, lng: 34.7818 },
    "Ramallah": { lat: 31.9038, lng: 35.2034 },
    "Nablus": { lat: 32.2211, lng: 35.2544 },
    "Hebron": { lat: 31.5326, lng: 35.0998 },
    "Arraba": { lat: 32.8533, lng: 35.3375 },
    "Amman": { lat: 31.9454, lng: 35.9284 },
    "Cairo": { lat: 30.0444, lng: 31.2357 },
    "Alexandria": { lat: 31.2001, lng: 29.9187 },
    "Jenin": { lat: 32.4646, lng: 35.2939 },
    "Tulkarm": { lat: 32.3086, lng: 35.0285 },
    "Bethlehem": { lat: 31.7054, lng: 35.2024 },
    "Jericho": { lat: 31.8611, lng: 35.4616 },
};

/**
 * Calculates the distance between two points on the Earth's surface using the Haversine formula.
 * @param lat1 User's latitude
 * @param lon1 User's longitude
 * @param lat2 Item's latitude
 * @param lon2 Item's longitude
 * @returns Distance in Kilometers (km)
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return Number(d.toFixed(1)); // Return rounded to 1 decimal place
}

function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
}
