const ORS_KEY      = import.meta.env.VITE_ORS_KEY as string
const BUSINESS_LNG = -96.6989
const BUSINESS_LAT = 33.0198
const ZIP_RADIUS_KM = 25

// Delivery is Texas only; the rectangle keeps same-named streets in other states out
const TEXAS_RECT = 'boundary.rect.min_lon=-106.65&boundary.rect.min_lat=25.83&boundary.rect.max_lon=-93.5&boundary.rect.max_lat=36.5'

interface GeoFeature { geometry: { coordinates: [number, number] }; properties: { region_a?: string } }

async function geocode(query: string, size = 5): Promise<[number, number] | null> {
  const res  = await fetch(`https://api.openrouteservice.org/geocode/search?api_key=${ORS_KEY}&boundary.country=US&${TEXAS_RECT}&size=${size}&${query}`)
  const data = await res.json() as { features?: GeoFeature[] }
  return data.features?.find((f) => f.properties.region_a === 'TX')?.geometry.coordinates ?? null
}

// Returns Texas coordinates for the address, or null if it can't be found in Texas.
// The ZIP is looked up first so the address only matches near it.
export async function geocodeAddress(address: string, zip: string): Promise<[number, number] | null> {
  const text   = encodeURIComponent(address)
  const zipKey = zip.match(/^\d{5}/)?.[0]

  if (zipKey) {
    const zipLoc = await geocode(`text=${zipKey}&layers=postalcode`)
    if (!zipLoc) return null
    const hit = await geocode(
      `text=${text}&boundary.circle.lon=${zipLoc[0]}&boundary.circle.lat=${zipLoc[1]}&boundary.circle.radius=${ZIP_RADIUS_KM}&focus.point.lon=${zipLoc[0]}&focus.point.lat=${zipLoc[1]}`
    )
    // Fall back to the ZIP centre so the fee is still close if the street isn't found
    return hit ?? zipLoc
  }

  return geocode(`text=${text}&focus.point.lat=${BUSINESS_LAT}&focus.point.lon=${BUSINESS_LNG}`)
}
