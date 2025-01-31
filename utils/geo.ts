/**
 * Checks if a point is inside a polygon using the ray casting algorithm
 * @param point [lat, lon] coordinates of the point to check
 * @param polygon Array of [lat, lon] coordinates forming the polygon
 * @returns boolean indicating if the point is inside the polygon
 */
export function isPointInPolygon(point: [number, number], polygon: number[][]): boolean {
  const [lat, lon] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    const intersect = ((yi > lon) !== (yj > lon)) &&
      (lat < (xj - xi) * (lon - yi) / (yj - yi) + xi);

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
} 
