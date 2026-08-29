import * as THREE from 'three';

/**
 * Converts Latitude & Longitude to 3D Vector3 on a sphere of given radius.
 */
export function latLngToVector3(lat: number, lng: number, radius: number = 2): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

/**
 * Generates an elevated 3D Quadratic Bezier Curve connecting two Lat/Lng coordinates.
 */
export function createFlightArc(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  radius: number = 2,
  elevationScale: number = 0.25
): { curve: THREE.QuadraticBezierCurve3; points: THREE.Vector3[] } {
  const p1 = latLngToVector3(lat1, lng1, radius);
  const p2 = latLngToVector3(lat2, lng2, radius);

  // Compute mid point
  const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
  const distance = p1.distanceTo(p2);

  // Elevate mid control point outward along normal vector
  const normal = mid.clone().normalize();
  const height = radius + distance * elevationScale;
  const controlPoint = normal.multiplyScalar(height);

  const curve = new THREE.QuadraticBezierCurve3(p1, controlPoint, p2);
  const points = curve.getPoints(50);

  return { curve, points };
}

/**
 * Currency formatter for Indian Rupee
 */
export function formatINR(val: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
}

/**
 * Delta formatter with explicit + / - sign
 */
export function formatDelta(val: number): string {
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(1)}%`;
}

/**
 * Standard integer formatter with Indian grouping
 */
export function formatCount(val: number): string {
  return new Intl.NumberFormat('en-IN').format(val);
}

/** Converts DD/MM/YY to 28 Aug'26 and monthly MM/YY values to Aug'26. */
export function formatMonthYearLabel(value: string): string {
  const parts = value.split('/');
  if (parts.length !== 2 && parts.length !== 3) return value;

  const month = Number(parts.length === 3 ? parts[1] : parts[0]);
  const year = parts.length === 3 ? parts[2] : parts[1];
  const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month - 1];
  if (!monthName || !year) return value;
  return parts.length === 3
    ? `${Number(parts[0])} ${monthName}'${year.slice(-2)}`
    : `${monthName}'${year.slice(-2)}`;
}
