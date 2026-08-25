const fs = require('fs');
const d3Geo = require('d3-geo');

// Read raw GeoJSON
const rawData = JSON.parse(fs.readFileSync('src/mock/india_states.json', 'utf8'));

// SVG target size
const width = 800;
const height = 900;

// Setup d3 geoMercator projection fitted to India
const projection = d3Geo.geoMercator()
  .center([82.5, 22.5]) // Geographic center of India
  .scale(1200)
  .translate([width / 2, height / 2]);

const pathGenerator = d3Geo.geoPath().projection(projection);

const statesData = [];

for (const feature of rawData.features) {
  const name = feature.properties.NAME_1 || feature.properties.name || feature.properties.ST_NM || feature.properties.state || 'Unknown';
  const stateCode = feature.properties.HASC_1 || feature.properties.id || name.substring(0, 2).toUpperCase();
  
  const path = pathGenerator(feature);
  if (!path) continue;

  // Compute centroid
  const centroid = d3Geo.geoCentroid(feature);
  const [projectedX, projectedY] = projection(centroid);

  statesData.push({
    name,
    stateCode,
    path,
    centroid: { lng: centroid[0], lat: centroid[1], x: Math.round(projectedX), y: Math.round(projectedY) }
  });
}

console.log(`Processed ${statesData.length} states/UTs.`);

const outputCode = `// Generated authentic D3 Geo projected SVG paths for all Indian States & Union Territories
export interface IndiaStatePath {
  name: string;
  stateCode: string;
  path: string;
  centroid: { lng: number; lat: number; x: number; y: number };
}

export const INDIA_SVG_WIDTH = ${width};
export const INDIA_SVG_HEIGHT = ${height};

export function projectLngLatToMap(lng: number, lat: number): { x: number; y: number } {
  // Center: [82.5, 22.5], Scale: 1200, Translate: [${width / 2}, ${height / 2}]
  const k = 1200;
  const lambda0 = (82.5 * Math.PI) / 180;
  const phi0 = (22.5 * Math.PI) / 180;

  const lambda = (lng * Math.PI) / 180;
  const phi = (lat * Math.PI) / 180;

  const x = ${width / 2} + k * (lambda - lambda0);
  const y = ${height / 2} - k * (Math.log(Math.tan(Math.PI / 4 + phi / 2)) - Math.log(Math.tan(Math.PI / 4 + phi0 / 2)));

  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}

export const INDIA_STATES_PATHS: IndiaStatePath[] = ${JSON.stringify(statesData, null, 2)};
`;

fs.writeFileSync('src/mock/indiaStatePaths.ts', outputCode, 'utf8');
console.log('Successfully generated src/mock/indiaStatePaths.ts');
