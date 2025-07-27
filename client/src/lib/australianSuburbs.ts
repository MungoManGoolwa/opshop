// Australian Suburbs Database for Location Search
// Contains major suburbs with coordinates for radius search functionality

export interface Suburb {
  name: string;
  state: string;
  postcode: string;
  latitude: number;
  longitude: number;
}

export const AUSTRALIAN_SUBURBS: Suburb[] = [
  // South Australia
  { name: "Goolwa", state: "SA", postcode: "5214", latitude: -35.5173, longitude: 138.7846 },
  { name: "Adelaide", state: "SA", postcode: "5000", latitude: -34.9285, longitude: 138.6007 },
  { name: "North Adelaide", state: "SA", postcode: "5006", latitude: -34.9081, longitude: 138.5933 },
  { name: "Victor Harbor", state: "SA", postcode: "5211", latitude: -35.5517, longitude: 138.6290 },
  { name: "Port Adelaide", state: "SA", postcode: "5015", latitude: -34.8459, longitude: 138.5089 },
  { name: "Mount Barker", state: "SA", postcode: "5251", latitude: -35.0686, longitude: 138.8584 },
  { name: "Murray Bridge", state: "SA", postcode: "5253", latitude: -35.1197, longitude: 139.2731 },
  
  // New South Wales
  { name: "Sydney", state: "NSW", postcode: "2000", latitude: -33.8688, longitude: 151.2093 },
  { name: "Bondi", state: "NSW", postcode: "2026", latitude: -33.8915, longitude: 151.2767 },
  { name: "Manly", state: "NSW", postcode: "2095", latitude: -33.7969, longitude: 151.2840 },
  { name: "Parramatta", state: "NSW", postcode: "2150", latitude: -33.8150, longitude: 151.0000 },
  { name: "Newcastle", state: "NSW", postcode: "2300", latitude: -32.9283, longitude: 151.7817 },
  { name: "Wollongong", state: "NSW", postcode: "2500", latitude: -34.4278, longitude: 150.8931 },
  { name: "Blue Mountains", state: "NSW", postcode: "2780", latitude: -33.7123, longitude: 150.3109 },
  { name: "Central Coast", state: "NSW", postcode: "2250", latitude: -33.4269, longitude: 151.3426 },
  
  // Victoria
  { name: "Melbourne", state: "VIC", postcode: "3000", latitude: -37.8136, longitude: 144.9631 },
  { name: "St Kilda", state: "VIC", postcode: "3182", latitude: -37.8677, longitude: 144.9811 },
  { name: "Richmond", state: "VIC", postcode: "3121", latitude: -37.8197, longitude: 144.9956 },
  { name: "Fitzroy", state: "VIC", postcode: "3065", latitude: -37.7986, longitude: 144.9781 },
  { name: "Geelong", state: "VIC", postcode: "3220", latitude: -38.1499, longitude: 144.3617 },
  { name: "Ballarat", state: "VIC", postcode: "3350", latitude: -37.5622, longitude: 143.8503 },
  { name: "Bendigo", state: "VIC", postcode: "3550", latitude: -36.7570, longitude: 144.2794 },
  { name: "Frankston", state: "VIC", postcode: "3199", latitude: -38.1421, longitude: 145.1218 },
  
  // Queensland
  { name: "Brisbane", state: "QLD", postcode: "4000", latitude: -27.4698, longitude: 153.0251 },
  { name: "Gold Coast", state: "QLD", postcode: "4217", latitude: -28.0167, longitude: 153.4000 },
  { name: "Sunshine Coast", state: "QLD", postcode: "4558", latitude: -26.6500, longitude: 153.0667 },
  { name: "Cairns", state: "QLD", postcode: "4870", latitude: -16.9186, longitude: 145.7781 },
  { name: "Townsville", state: "QLD", postcode: "4810", latitude: -19.2590, longitude: 146.8169 },
  { name: "Toowoomba", state: "QLD", postcode: "4350", latitude: -27.5598, longitude: 151.9507 },
  { name: "Rockhampton", state: "QLD", postcode: "4700", latitude: -23.3781, longitude: 150.5136 },
  
  // Western Australia
  { name: "Perth", state: "WA", postcode: "6000", latitude: -31.9505, longitude: 115.8605 },
  { name: "Fremantle", state: "WA", postcode: "6160", latitude: -32.0569, longitude: 115.7508 },
  { name: "Bunbury", state: "WA", postcode: "6230", latitude: -33.3267, longitude: 115.6369 },
  { name: "Mandurah", state: "WA", postcode: "6210", latitude: -32.5269, longitude: 115.7217 },
  { name: "Kalgoorlie", state: "WA", postcode: "6430", latitude: -30.7333, longitude: 121.4667 },
  { name: "Albany", state: "WA", postcode: "6330", latitude: -35.0275, longitude: 117.8840 },
  
  // Tasmania
  { name: "Hobart", state: "TAS", postcode: "7000", latitude: -42.8821, longitude: 147.3272 },
  { name: "Launceston", state: "TAS", postcode: "7250", latitude: -41.4332, longitude: 147.1441 },
  { name: "Devonport", state: "TAS", postcode: "7310", latitude: -41.1789, longitude: 146.3516 },
  { name: "Burnie", state: "TAS", postcode: "7320", latitude: -41.0545, longitude: 145.9092 },
  
  // Northern Territory
  { name: "Darwin", state: "NT", postcode: "0800", latitude: -12.4634, longitude: 130.8456 },
  { name: "Alice Springs", state: "NT", postcode: "0870", latitude: -23.6980, longitude: 133.8807 },
  { name: "Katherine", state: "NT", postcode: "0850", latitude: -14.4652, longitude: 132.2642 },
  
  // Australian Capital Territory
  { name: "Canberra", state: "ACT", postcode: "2600", latitude: -35.2809, longitude: 149.1300 },
  { name: "Tuggeranong", state: "ACT", postcode: "2900", latitude: -35.4244, longitude: 149.0931 },
  { name: "Belconnen", state: "ACT", postcode: "2617", latitude: -35.2388, longitude: 149.0628 },
];

// Search function with fuzzy matching
export function searchSuburbs(query: string): Suburb[] {
  const searchTerm = query.toLowerCase().trim();
  
  if (!searchTerm) return AUSTRALIAN_SUBURBS.slice(0, 10); // Return top 10 when empty
  
  return AUSTRALIAN_SUBURBS
    .filter(suburb => 
      suburb.name.toLowerCase().includes(searchTerm) ||
      suburb.state.toLowerCase().includes(searchTerm) ||
      suburb.postcode.includes(searchTerm)
    )
    .sort((a, b) => {
      // Prioritize exact matches
      const aExact = a.name.toLowerCase() === searchTerm;
      const bExact = b.name.toLowerCase() === searchTerm;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Then prioritize starts with
      const aStarts = a.name.toLowerCase().startsWith(searchTerm);
      const bStarts = b.name.toLowerCase().startsWith(searchTerm);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      
      // Finally alphabetical
      return a.name.localeCompare(b.name);
    })
    .slice(0, 20); // Limit to 20 results
}

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

// Get suburbs within radius
export function getSuburbsWithinRadius(
  centerLat: number, 
  centerLon: number, 
  radiusKm: number
): Suburb[] {
  return AUSTRALIAN_SUBURBS.filter(suburb => {
    const distance = calculateDistance(centerLat, centerLon, suburb.latitude, suburb.longitude);
    return distance <= radiusKm;
  });
}