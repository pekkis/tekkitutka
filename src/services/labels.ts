const quadrants = (process.env.NEXT_PUBLIC_QUADRANTS as string)
  .split(";")
  .map((quadrant) => quadrant.trim());

const rings = (process.env.NEXT_PUBLIC_RINGS as string)
  .split(";")
  .map((ring) => ring.trim());

export function quadrantName(quadrant: number): string {
  return quadrants[quadrant];
}

export function ringName(ring: number): string {
  return rings[ring];
}
