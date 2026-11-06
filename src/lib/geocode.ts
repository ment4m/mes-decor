const ORS_KEY      = import.meta.env.VITE_ORS_KEY as string
const BUSINESS_LNG = -96.6989
const BUSINESS_LAT = 33.0198
const ZIP_RADIUS_KM = 25

async function geocode(query: string): Promise<{ features?: { geometry: { coordinates: [number, number] } }[] }> {
  const res = await fetch(`https://api.openrouteservice.org/geocode/search?api_key=${ORS_KEY}&boundary.country=US&${query}`)
  return res.json()
}

// Street name + ZIP often matches a same-named street in another state, so find the
// ZIP's location first and only accept address matches near it.
export async function geocodeAddress(address: string, zip: string): Promise<[number, number] | null> {
  const text   = encodeURIComponent(address)
  const zipKey = zip.match(/^\d{5}/)?.[0]

  if (zipKey) {
    const zipData = await geocode(`text=${zipKey}&layers=postalcode&size=1`)
    const zipLoc  = zipData.features?.[0]?.geometry.coordinates
    if (zipLoc) {
      const near = await geocode(
        `text=${text}&boundary.circle.lon=${zipLoc[0]}&boundary.circle.lat=${zipLoc[1]}&boundary.circle.radius=${ZIP_RADIUS_KM}&focus.point.lon=${zipLoc[0]}&focus.point.lat=${zipLoc[1]}&size=1`
      )
      const hit = near.features?.[0]?.geometry.coordinates
      // Fall back to the ZIP centre so the fee is still close if the street isn't found
      return hit ?? zipLoc
    }
  }

  const data = await geocode(`text=${text}${zip ? encodeURIComponent(`, ${zip}`) : ''}&focus.point.lat=${BUSINESS_LAT}&focus.point.lon=${BUSINESS_LNG}&size=1`)
  return data.features?.[0]?.geometry.coordinates ?? null
}
