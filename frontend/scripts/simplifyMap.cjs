const fs = require('fs');
const d3Geo = require('d3-geo');

// Target size
const width = 800;
const height = 900;

// Setup d3 geoMercator projection fitted to India
const projection = d3Geo.geoMercator()
  .center([82.8, 22.8]) // Geographic center of India
  .scale(1220)
  .translate([width / 2, height / 2]);

// Douglas-Peucker point simplification
function simplifyPoints(points, sqTolerance) {
  if (points.length <= 2) return points;

  function getSqSegDist(p, p1, p2) {
    let x = p1[0], y = p1[1];
    let dx = p2[0] - x, dy = p2[1] - y;

    if (dx !== 0 || dy !== 0) {
      const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
      if (t > 1) {
        x = p2[0];
        y = p2[1];
      } else if (t > 0) {
        x += dx * t;
        y += dy * t;
      }
    }

    dx = p[0] - x;
    dy = p[1] - y;
    return dx * dx + dy * dy;
  }

  function simplifyDPStep(points, first, last, sqTolerance, simplified) {
    let maxSqDist = sqTolerance;
    let index = -1;

    for (let i = first + 1; i < last; i++) {
      const sqDist = getSqSegDist(points[i], points[first], points[last]);
      if (sqDist > maxSqDist) {
        index = i;
        maxSqDist = sqDist;
      }
    }

    if (maxSqDist > sqTolerance) {
      if (index - first > 1) simplifyDPStep(points, first, index, sqTolerance, simplified);
      simplified.push(points[index]);
      if (last - index > 1) simplifyDPStep(points, index, last, sqTolerance, simplified);
    }
  }

  const last = points.length - 1;
  const simplified = [points[0]];
  simplifyDPStep(points, 0, last, sqTolerance, simplified);
  simplified.push(points[last]);
  return simplified;
}

// Convert GeoJSON polygon coordinates to simplified SVG path
function polygonToSVGPath(coordinates, type) {
  let pathStr = '';

  const polygons = type === 'MultiPolygon' ? coordinates : [coordinates];

  for (const polygon of polygons) {
    for (let ringIdx = 0; ringIdx < polygon.length; ringIdx++) {
      const rawRing = polygon[ringIdx];
      // Project points first
      const projectedRing = rawRing.map(pt => {
        const [x, y] = projection(pt);
        return [x, y];
      });

      // Simplify projected 2D points (sqTolerance in screen pixels)
      const simplified = simplifyPoints(projectedRing, 1.2); // ~1.2 px tolerance
      if (simplified.length < 3) continue;

      pathStr += 'M ' + simplified[0][0].toFixed(1) + ' ' + simplified[0][1].toFixed(1);
      for (let i = 1; i < simplified.length; i++) {
        pathStr += ' L ' + simplified[i][0].toFixed(1) + ' ' + simplified[i][1].toFixed(1);
      }
      pathStr += ' Z ';
    }
  }

  return pathStr.trim();
}

// Read raw state GeoJSON if available, or fetch if needed
async function run() {
  let rawData;
  const rawPath = 'src/mock/india_states.json';
  
  if (fs.existsSync(rawPath)) {
    rawData = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
  } else {
    // Fetch from verified CDN raw
    const response = await fetch('https://raw.githubusercontent.com/geohacker/india/master/state/india_telengana.geojson');
    rawData = await response.json();
  }

  const statesData = [];

  for (const feature of rawData.features) {
    const name = feature.properties.NAME_1 || feature.properties.name || feature.properties.ST_NM || feature.properties.state || 'Unknown';
    const stateCode = feature.properties.HASC_1 || feature.properties.id || name.substring(0, 2).toUpperCase();

    const path = polygonToSVGPath(feature.geometry.coordinates, feature.geometry.type);
    if (!path) continue;

    const centroid = d3Geo.geoCentroid(feature);
    const [projectedX, projectedY] = projection(centroid);

    statesData.push({
      name,
      stateCode,
      path,
      centroid: {
        lng: Math.round(centroid[0] * 100) / 100,
        lat: Math.round(centroid[1] * 100) / 100,
        x: Math.round(projectedX),
        y: Math.round(projectedY),
      }
    });
  }

  console.log(`Generated ${statesData.length} smooth, authentic state shapes.`);

  const mapDataTS = `// One Shared Source of Truth for India Geographic Geometry & Coordinates
export interface IndiaStatePath {
  name: string;
  stateCode: string;
  path: string;
  centroid: { lng: number; lat: number; x: number; y: number };
}

export interface AviationHub {
  id: string;
  name: string;
  city: string;
  code: string;
  state: string;
  region: 'North' | 'South' | 'West' | 'East' | 'Central' | 'North-East';
  lat: number;
  lng: number;
  avgFare: number;
  apix: number;
  activeRoutes: number;
  dailyTraffic: number;
  volatility: string;
  anomalyStatus: 'Normal' | 'Elevated' | 'Critical Anomaly';
  isTop6: boolean;
  notes: string;
}

export interface MapRouteArc {
  id: string;
  originCode: string;
  destCode: string;
  originCity: string;
  destCity: string;
  currentFare: number;
  historicalAvg: number;
  fareChange: number;
  status: 'normal' | 'elevated' | 'anomaly';
  distanceKm: number;
  weeklyFlights: number;
  weight: number;
  volatility: number;
  observations: number;
  dominantCarrier: string;
  anomalyReason?: string;
  historicalData?: { date: string; fare: number; upperBand: number; lowerBand: number; volume: number }[];
}

export const INDIA_SVG_WIDTH = ${width};
export const INDIA_SVG_HEIGHT = ${height};

// Mathematical D3-aligned Mercator projection for exact geographic alignment
export function projectLngLatToMap(lng: number, lat: number): { x: number; y: number } {
  const k = 1220;
  const lambda0 = (82.8 * Math.PI) / 180;
  const phi0 = (22.8 * Math.PI) / 180;

  const lambda = (lng * Math.PI) / 180;
  const phi = (lat * Math.PI) / 180;

  const x = ${width / 2} + k * (lambda - lambda0);
  const y = ${height / 2} - k * (Math.log(Math.tan(Math.PI / 4 + phi / 2)) - Math.log(Math.tan(Math.PI / 4 + phi0 / 2)));

  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}

// 9 Required Aviation Hubs with Verified Geographic Coordinates
export const AVIATION_HUBS: AviationHub[] = [
  // Top 6 Hubs (Active Route Arcs Displayed)
  {
    id: 'hub-del',
    name: 'Indira Gandhi International Airport',
    city: 'Delhi',
    code: 'DEL',
    state: 'Delhi NCR',
    region: 'North',
    lat: 28.5562,
    lng: 77.1000,
    avgFare: 5680,
    apix: 108.4,
    activeRoutes: 14,
    dailyTraffic: 1420,
    volatility: '18.4%',
    anomalyStatus: 'Critical Anomaly',
    isTop6: true,
    notes: 'Primary national gateway; high business frequency with DEL-BOM yield spike (+38.7%).'
  },
  {
    id: 'hub-bom',
    name: 'Chhatrapati Shivaji Maharaj International',
    city: 'Mumbai',
    code: 'BOM',
    state: 'Maharashtra',
    region: 'West',
    lat: 19.0896,
    lng: 72.8656,
    avgFare: 6120,
    apix: 116.2,
    activeRoutes: 12,
    dailyTraffic: 1050,
    volatility: '22.1%',
    anomalyStatus: 'Critical Anomaly',
    isTop6: true,
    notes: 'Commercial capital trunk; runway slot saturation and peak holiday surge.'
  },
  {
    id: 'hub-blr',
    name: 'Kempegowda International Airport',
    city: 'Bangalore',
    code: 'BLR',
    state: 'Karnataka',
    region: 'South',
    lat: 13.1986,
    lng: 77.7066,
    avgFare: 5240,
    apix: 106.8,
    activeRoutes: 11,
    dailyTraffic: 780,
    volatility: '12.4%',
    anomalyStatus: 'Normal',
    isTop6: true,
    notes: 'Technology corridor anchor; high stable corporate commuter volume.'
  },
  {
    id: 'hub-ccu',
    name: 'Netaji Subhash Chandra Bose International',
    city: 'Kolkata',
    code: 'CCU',
    state: 'West Bengal',
    region: 'East',
    lat: 22.6547,
    lng: 88.4467,
    avgFare: 5350,
    apix: 114.2,
    activeRoutes: 9,
    dailyTraffic: 410,
    volatility: '24.5%',
    anomalyStatus: 'Critical Anomaly',
    isTop6: true,
    notes: 'Eastern hub; pre-Durga festival forward bookings surging (+24.2%).'
  },
  {
    id: 'hub-hyd',
    name: 'Rajiv Gandhi International Airport',
    city: 'Hyderabad',
    code: 'HYD',
    state: 'Telangana',
    region: 'South',
    lat: 17.2403,
    lng: 78.4294,
    avgFare: 4890,
    apix: 104.5,
    activeRoutes: 10,
    dailyTraffic: 540,
    volatility: '9.8%',
    anomalyStatus: 'Normal',
    isTop6: true,
    notes: 'Central-south transfer hub; competitive multi-carrier yields.'
  },
  {
    id: 'hub-amd',
    name: 'Sardar Vallabhbhai Patel International',
    city: 'Ahmedabad',
    code: 'AMD',
    state: 'Gujarat',
    region: 'West',
    lat: 23.0772,
    lng: 72.6347,
    avgFare: 4720,
    apix: 98.8,
    activeRoutes: 7,
    dailyTraffic: 260,
    volatility: '11.2%',
    anomalyStatus: 'Normal',
    isTop6: true,
    notes: 'Western industrial hub; balanced supply and steady pricing.'
  },

  // Additional 3 Locations (Markers only, NO route lines to keep map clean)
  {
    id: 'hub-maa',
    name: 'Chennai International Airport',
    city: 'Chennai',
    code: 'MAA',
    state: 'Tamil Nadu',
    region: 'South',
    lat: 12.9941,
    lng: 80.1709,
    avgFare: 4950,
    apix: 105.1,
    activeRoutes: 8,
    dailyTraffic: 490,
    volatility: '10.5%',
    anomalyStatus: 'Normal',
    isTop6: false,
    notes: 'Southern automotive & IT hub; steady coastal network availability.'
  },
  {
    id: 'hub-goi',
    name: 'Dabolim / Manohar International Airport',
    city: 'Goa',
    code: 'GOA',
    state: 'Goa',
    region: 'West',
    lat: 15.3808,
    lng: 73.8313,
    avgFare: 5890,
    apix: 111.4,
    activeRoutes: 6,
    dailyTraffic: 240,
    volatility: '21.0%',
    anomalyStatus: 'Elevated',
    isTop6: false,
    notes: 'High leisure weekend demand profile with seasonal fare premiums.'
  },
  {
    id: 'hub-lko',
    name: 'Chaudhary Charan Singh International Airport',
    city: 'Lucknow',
    code: 'LUCKNOW',
    state: 'Uttar Pradesh',
    region: 'North',
    lat: 26.7606,
    lng: 80.8893,
    avgFare: 4840,
    apix: 104.1,
    activeRoutes: 6,
    dailyTraffic: 280,
    volatility: '13.2%',
    anomalyStatus: 'Normal',
    isTop6: false,
    notes: 'Northern arterial connection; strong traffic connectivity to Delhi and Mumbai.'
  }
];

// Active routes strictly between the TOP 6 LOCATIONS only
export const TOP_6_ROUTES: MapRouteArc[] = [
  {
    id: 'DEL-BOM',
    originCode: 'DEL',
    destCode: 'BOM',
    originCity: 'Delhi',
    destCity: 'Mumbai',
    currentFare: 8950,
    historicalAvg: 5240,
    fareChange: +38.7,
    status: 'anomaly',
    distanceKm: 1148,
    weeklyFlights: 385,
    weight: 16.4,
    volatility: 88,
    observations: 3420,
    dominantCarrier: 'IndiGo / Air India',
    anomalyReason: 'Peak business slot consolidation and sudden equipment downgrade on trunk frequency.',
    historicalData: [
      { date: 'Aug 01', fare: 5200, upperBand: 6100, lowerBand: 4400, volume: 112 },
      { date: 'Aug 05', fare: 5450, upperBand: 6300, lowerBand: 4600, volume: 125 },
      { date: 'Aug 09', fare: 5800, upperBand: 6800, lowerBand: 4900, volume: 140 },
      { date: 'Aug 13', fare: 6400, upperBand: 7200, lowerBand: 5200, volume: 168 },
      { date: 'Aug 17', fare: 7300, upperBand: 8100, lowerBand: 6000, volume: 195 },
      { date: 'Aug 21', fare: 8400, upperBand: 9200, lowerBand: 6900, volume: 220 },
      { date: 'Aug 24', fare: 8950, upperBand: 9800, lowerBand: 7400, volume: 245 },
    ]
  },
  {
    id: 'DEL-BLR',
    originCode: 'DEL',
    destCode: 'BLR',
    originCity: 'Delhi',
    destCity: 'Bengaluru',
    currentFare: 6250,
    historicalAvg: 5400,
    fareChange: +7.7,
    status: 'normal',
    distanceKm: 1740,
    weeklyFlights: 290,
    weight: 13.2,
    volatility: 42,
    observations: 2840,
    dominantCarrier: 'IndiGo / Akasa Air',
    historicalData: [
      { date: 'Aug 01', fare: 5350, upperBand: 6000, lowerBand: 4600, volume: 95 },
      { date: 'Aug 05', fare: 5400, upperBand: 6100, lowerBand: 4700, volume: 98 },
      { date: 'Aug 09', fare: 5650, upperBand: 6350, lowerBand: 4900, volume: 104 },
      { date: 'Aug 13', fare: 5900, upperBand: 6600, lowerBand: 5100, volume: 112 },
      { date: 'Aug 17', fare: 6050, upperBand: 6800, lowerBand: 5250, volume: 120 },
      { date: 'Aug 21', fare: 6180, upperBand: 7000, lowerBand: 5400, volume: 128 },
      { date: 'Aug 24', fare: 6250, upperBand: 7100, lowerBand: 5500, volume: 135 },
    ]
  },
  {
    id: 'DEL-HYD',
    originCode: 'DEL',
    destCode: 'HYD',
    originCity: 'Delhi',
    destCity: 'Hyderabad',
    currentFare: 5120,
    historicalAvg: 4750,
    fareChange: +3.4,
    status: 'normal',
    distanceKm: 1260,
    weeklyFlights: 220,
    weight: 9.8,
    volatility: 31,
    observations: 2150,
    dominantCarrier: 'IndiGo / Air India',
    historicalData: [
      { date: 'Aug 01', fare: 4800, upperBand: 5400, lowerBand: 4100, volume: 80 },
      { date: 'Aug 05', fare: 4880, upperBand: 5500, lowerBand: 4200, volume: 82 },
      { date: 'Aug 09', fare: 4950, upperBand: 5600, lowerBand: 4250, volume: 85 },
      { date: 'Aug 13', fare: 5020, upperBand: 5700, lowerBand: 4300, volume: 88 },
      { date: 'Aug 17', fare: 5080, upperBand: 5750, lowerBand: 4350, volume: 92 },
      { date: 'Aug 21', fare: 5100, upperBand: 5800, lowerBand: 4400, volume: 95 },
      { date: 'Aug 24', fare: 5120, upperBand: 5850, lowerBand: 4420, volume: 98 },
    ]
  },
  {
    id: 'DEL-CCU',
    originCode: 'DEL',
    destCode: 'CCU',
    originCity: 'Delhi',
    destCity: 'Kolkata',
    currentFare: 7890,
    historicalAvg: 5120,
    fareChange: +24.2,
    status: 'anomaly',
    distanceKm: 1305,
    weeklyFlights: 210,
    weight: 8.9,
    volatility: 76,
    observations: 1980,
    dominantCarrier: 'Air India / IndiGo',
    anomalyReason: 'Pre-Durga festival forward bookings surging (+24.2%) and capacity shift.',
    historicalData: [
      { date: 'Aug 01', fare: 5200, upperBand: 5900, lowerBand: 4400, volume: 72 },
      { date: 'Aug 05', fare: 5600, upperBand: 6300, lowerBand: 4700, volume: 78 },
      { date: 'Aug 09', fare: 6200, upperBand: 7000, lowerBand: 5200, volume: 86 },
      { date: 'Aug 13', fare: 6850, upperBand: 7600, lowerBand: 5700, volume: 95 },
      { date: 'Aug 17', fare: 7300, upperBand: 8200, lowerBand: 6100, volume: 108 },
      { date: 'Aug 21', fare: 7650, upperBand: 8600, lowerBand: 6450, volume: 118 },
      { date: 'Aug 24', fare: 7890, upperBand: 8900, lowerBand: 6700, volume: 126 },
    ]
  },
  {
    id: 'DEL-AMD',
    originCode: 'DEL',
    destCode: 'AMD',
    originCity: 'Delhi',
    destCity: 'Ahmedabad',
    currentFare: 4720,
    historicalAvg: 4600,
    fareChange: -1.6,
    status: 'normal',
    distanceKm: 760,
    weeklyFlights: 175,
    weight: 6.4,
    volatility: 29,
    observations: 1620,
    dominantCarrier: 'IndiGo / Akasa Air',
  },
  {
    id: 'BOM-BLR',
    originCode: 'BOM',
    destCode: 'BLR',
    originCity: 'Mumbai',
    destCity: 'Bengaluru',
    currentFare: 4320,
    historicalAvg: 3950,
    fareChange: +5.3,
    status: 'normal',
    distanceKm: 842,
    weeklyFlights: 245,
    weight: 11.5,
    volatility: 35,
    observations: 2450,
    dominantCarrier: 'IndiGo / Vistara',
  },
  {
    id: 'BOM-HYD',
    originCode: 'BOM',
    destCode: 'HYD',
    originCity: 'Mumbai',
    destCity: 'Hyderabad',
    currentFare: 3790,
    historicalAvg: 3620,
    fareChange: +0.4,
    status: 'normal',
    distanceKm: 620,
    weeklyFlights: 160,
    weight: 4.5,
    volatility: 24,
    observations: 1540,
    dominantCarrier: 'IndiGo / Air India',
  },
  {
    id: 'BOM-CCU',
    originCode: 'BOM',
    destCode: 'CCU',
    originCity: 'Mumbai',
    destCity: 'Kolkata',
    currentFare: 6850,
    historicalAvg: 5900,
    fareChange: +12.4,
    status: 'elevated',
    distanceKm: 1650,
    weeklyFlights: 140,
    weight: 5.2,
    volatility: 54,
    observations: 1420,
    dominantCarrier: 'Air India / IndiGo',
  },
  {
    id: 'BOM-AMD',
    originCode: 'BOM',
    destCode: 'AMD',
    originCity: 'Mumbai',
    destCity: 'Ahmedabad',
    currentFare: 3150,
    historicalAvg: 3080,
    fareChange: +2.1,
    status: 'normal',
    distanceKm: 440,
    weeklyFlights: 150,
    weight: 4.1,
    volatility: 22,
    observations: 1380,
    dominantCarrier: 'IndiGo / Akasa Air',
  },
  {
    id: 'BLR-HYD',
    originCode: 'BLR',
    destCode: 'HYD',
    originCity: 'Bengaluru',
    destCity: 'Hyderabad',
    currentFare: 3100,
    historicalAvg: 3040,
    fareChange: +1.8,
    status: 'normal',
    distanceKm: 500,
    weeklyFlights: 180,
    weight: 3.8,
    volatility: 20,
    observations: 1650,
    dominantCarrier: 'IndiGo / Air India',
  },
  {
    id: 'BLR-CCU',
    originCode: 'BLR',
    destCode: 'CCU',
    originCity: 'Bengaluru',
    destCity: 'Kolkata',
    currentFare: 6420,
    historicalAvg: 5880,
    fareChange: +8.4,
    status: 'elevated',
    distanceKm: 1560,
    weeklyFlights: 130,
    weight: 4.6,
    volatility: 46,
    observations: 1290,
    dominantCarrier: 'IndiGo / Air India',
  },
  {
    id: 'HYD-CCU',
    originCode: 'HYD',
    destCode: 'CCU',
    originCity: 'Hyderabad',
    destCity: 'Kolkata',
    currentFare: 5400,
    historicalAvg: 5180,
    fareChange: +4.2,
    status: 'normal',
    distanceKm: 1180,
    weeklyFlights: 110,
    weight: 3.2,
    volatility: 28,
    observations: 1120,
    dominantCarrier: 'IndiGo / SpiceJet',
  },
  {
    id: 'AMD-BLR',
    originCode: 'AMD',
    destCode: 'BLR',
    originCity: 'Ahmedabad',
    destCity: 'Bengaluru',
    currentFare: 4950,
    historicalAvg: 4800,
    fareChange: +3.0,
    status: 'normal',
    distanceKm: 1240,
    weeklyFlights: 95,
    weight: 3.0,
    volatility: 26,
    observations: 980,
    dominantCarrier: 'Akasa Air / IndiGo',
  },
];

export const INDIA_STATES_PATHS: IndiaStatePath[] = ${JSON.stringify(statesData, null, 2)};
`;

  // Create directory if not exists
  if (!fs.existsSync('src/components/india-map')) {
    fs.mkdirSync('src/components/india-map', { recursive: true });
  }

  fs.writeFileSync('src/components/india-map/mapData.ts', mapDataTS, 'utf8');
  console.log('Successfully written to src/components/india-map/mapData.ts');
}

run();
