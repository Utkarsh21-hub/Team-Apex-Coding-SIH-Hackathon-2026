/**
 * Geospatial Service for Legal Metrology GIS Enforcement
 * Provides Haversine distance calculations, Indian Postal Code geocoding,
 * and geographic radius filtering.
 */

export interface GeoLocationResult {
  pincode: string;
  lat: number;
  lng: number;
  areaName: string;
  city: string;
  state: string;
  isApproximate?: boolean;
}

// Built-in high-precision coordinates for key Indian industrial, commercial, and wholesale zones
export const INDIAN_PINCODES: Record<string, Omit<GeoLocationResult, 'pincode'>> = {
  // Gujarat / Ahmedabad Hubs
  '382330': {
    lat: 23.0805,
    lng: 72.6644,
    areaName: 'Naroda GIDC & Transport Nagar',
    city: 'Ahmedabad',
    state: 'Gujarat',
  },
  '380001': {
    lat: 23.0225,
    lng: 72.5714,
    areaName: 'Bhadra & Relief Road Commercial Market',
    city: 'Ahmedabad',
    state: 'Gujarat',
  },
  '380015': {
    lat: 23.0270,
    lng: 72.5255,
    areaName: 'Satellite & SG Highway Commercial Corridor',
    city: 'Ahmedabad',
    state: 'Gujarat',
  },
  '382440': {
    lat: 22.9567,
    lng: 72.6288,
    areaName: 'Vatva GIDC Industrial Area',
    city: 'Ahmedabad',
    state: 'Gujarat',
  },
  '395002': {
    lat: 21.1959,
    lng: 72.8302,
    areaName: 'Ring Road Textile Market',
    city: 'Surat',
    state: 'Gujarat',
  },
  '360003': {
    lat: 22.2858,
    lng: 70.8175,
    areaName: 'Aji GIDC Industrial Estate',
    city: 'Rajkot',
    state: 'Gujarat',
  },

  // Delhi NCR Hubs
  '110085': {
    lat: 28.7166,
    lng: 77.1166,
    areaName: 'Rohini Sector 7 & 8 Commercial Complex',
    city: 'North West Delhi',
    state: 'Delhi',
  },
  '110033': {
    lat: 28.7180,
    lng: 77.1750,
    areaName: 'Azadpur Wholesale Fruit & Vegetable Mandi',
    city: 'North Delhi',
    state: 'Delhi',
  },
  '110006': {
    lat: 28.6506,
    lng: 77.2303,
    areaName: 'Chandni Chowk & Khari Baoli Spice Mandi',
    city: 'Central Delhi',
    state: 'Delhi',
  },
  '110020': {
    lat: 28.5355,
    lng: 77.2710,
    areaName: 'Okhla Industrial Area Phase I & II',
    city: 'South Delhi',
    state: 'Delhi',
  },
  '110001': {
    lat: 28.6304,
    lng: 77.2177,
    areaName: 'Connaught Place & Barakhamba Road',
    city: 'New Delhi',
    state: 'Delhi',
  },

  // Maharashtra / Mumbai Hubs
  '400703': {
    lat: 19.0771,
    lng: 72.9986,
    areaName: 'APMC Wholesale Grain & Onion Potato Market, Vashi',
    city: 'Navi Mumbai',
    state: 'Maharashtra',
  },
  '400001': {
    lat: 18.9322,
    lng: 72.8347,
    areaName: 'Fort Commercial District & Port Yard',
    city: 'Mumbai',
    state: 'Maharashtra',
  },
  '400069': {
    lat: 19.1136,
    lng: 72.8697,
    areaName: 'Andheri East MIDC & SEEPZ',
    city: 'Mumbai',
    state: 'Maharashtra',
  },
  '411018': {
    lat: 18.6279,
    lng: 73.8131,
    areaName: 'Pimpri Industrial & Manufacturing Zone',
    city: 'Pune',
    state: 'Maharashtra',
  },

  // West Bengal / Kolkata Hubs
  '700091': {
    lat: 22.5804,
    lng: 88.4378,
    areaName: 'Sector V Salt Lake & GATC Calibration Corridor',
    city: 'Kolkata',
    state: 'West Bengal',
  },
  '700007': {
    lat: 22.5867,
    lng: 88.3562,
    areaName: 'Burrabazar Posta Wholesale Commodity Market',
    city: 'Kolkata',
    state: 'West Bengal',
  },

  // Karnataka / Bangalore Hubs
  '560001': {
    lat: 12.9716,
    lng: 77.5946,
    areaName: 'Chickpet & City Market Wholesale Area',
    city: 'Bengaluru',
    state: 'Karnataka',
  },
  '560058': {
    lat: 13.0285,
    lng: 77.5195,
    areaName: 'Peenya Industrial Estate Phase 1-4',
    city: 'Bengaluru',
    state: 'Karnataka',
  },

  // Telangana / Hyderabad
  '500016': {
    lat: 17.4435,
    lng: 78.4719,
    areaName: 'Begumpet & Balanagar Industrial Zone',
    city: 'Hyderabad',
    state: 'Telangana',
  },

  // Tamil Nadu / Chennai
  '600001': {
    lat: 13.0891,
    lng: 80.2877,
    areaName: 'George Town Wholesale & Harbour Terminal',
    city: 'Chennai',
    state: 'Tamil Nadu',
  },

  // Rajasthan / Jaipur
  '302022': {
    lat: 26.7825,
    lng: 75.8236,
    areaName: 'Sitapura Industrial Area',
    city: 'Jaipur',
    state: 'Rajasthan',
  },

  // Uttar Pradesh / Kanpur
  '208001': {
    lat: 26.4677,
    lng: 80.3498,
    areaName: 'Nayaganj Wholesale Grain & Metal Market',
    city: 'Kanpur',
    state: 'Uttar Pradesh',
  },
};

/**
 * Calculates distance between two coordinates using the Haversine formula (in kilometers)
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Resolves a 6-digit Indian Pincode to geographic coordinates.
 * 1. Checks verified local directory (instant, reliable, works offline)
 * 2. Attempts OpenStreetMap Nominatim geocoding
 * 3. Falls back to regional centroid if unknown
 */
export async function geocodePincode(rawPincode: string): Promise<GeoLocationResult | null> {
  const pincode = rawPincode.trim().replace(/\s+/g, '');
  if (!/^\d{6}$/.test(pincode)) {
    return null;
  }

  // 1. Check local lookup table
  if (INDIAN_PINCODES[pincode]) {
    const data = INDIAN_PINCODES[pincode];
    return {
      pincode,
      lat: data.lat,
      lng: data.lng,
      areaName: data.areaName,
      city: data.city,
      state: data.state,
    };
  }

  // 2. Try external geocoding via OpenStreetMap Nominatim (with strict timeout)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(
        pincode
      )}&country=India&format=json&limit=1`,
      {
        signal: controller.signal,
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'VerifyMetro-LegalMetrology-GIS/1.0',
        },
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const displayName = item.display_name || '';
        const parts = displayName.split(',').map((p: string) => p.trim());
        const areaName = parts[0] || `Pincode ${pincode}`;
        const city = parts[1] || parts[parts.length - 3] || 'Commercial Hub';
        const state = parts[parts.length - 2] || 'India';

        return {
          pincode,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          areaName,
          city,
          state,
        };
      }
    }
  } catch (err) {
    // Network failure or timeout; fallback to regional zone centroid
    console.info(`Nominatim geocoding bypassed for pincode ${pincode}:`, err);
  }

  // 3. Approximate Regional Centroid based on Postal Zone (First 2 Digits)
  const zonePrefix = pincode.substring(0, 2);
  const regionalCentroids: Record<string, { lat: number; lng: number; city: string; state: string }> = {
    '11': { lat: 28.6139, lng: 77.2090, city: 'Delhi', state: 'Delhi' },
    '12': { lat: 28.4595, lng: 77.0266, city: 'Gurugram', state: 'Haryana' },
    '20': { lat: 26.8467, lng: 80.9462, city: 'Lucknow', state: 'Uttar Pradesh' },
    '30': { lat: 26.9124, lng: 75.7873, city: 'Jaipur', state: 'Rajasthan' },
    '38': { lat: 23.0225, lng: 72.5714, city: 'Ahmedabad', state: 'Gujarat' },
    '39': { lat: 21.1702, lng: 72.8311, city: 'Surat', state: 'Gujarat' },
    '40': { lat: 18.9322, lng: 72.8347, city: 'Mumbai', state: 'Maharashtra' },
    '41': { lat: 18.5204, lng: 73.8567, city: 'Pune', state: 'Maharashtra' },
    '50': { lat: 17.3850, lng: 78.4867, city: 'Hyderabad', state: 'Telangana' },
    '56': { lat: 12.9716, lng: 77.5946, city: 'Bengaluru', state: 'Karnataka' },
    '60': { lat: 13.0827, lng: 80.2707, city: 'Chennai', state: 'Tamil Nadu' },
    '70': { lat: 22.5726, lng: 88.3639, city: 'Kolkata', state: 'West Bengal' },
  };

  const matchedZone = regionalCentroids[zonePrefix];
  if (matchedZone) {
    return {
      pincode,
      lat: matchedZone.lat,
      lng: matchedZone.lng,
      areaName: `Postal Zone ${pincode}`,
      city: matchedZone.city,
      state: matchedZone.state,
      isApproximate: true,
    };
  }

  return null;
}

export const lookupPincode = geocodePincode;
