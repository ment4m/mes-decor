const BASE_ID        = import.meta.env.VITE_AIRTABLE_BASE_ID
const TABLE_ID       = import.meta.env.VITE_AIRTABLE_TABLE_ID
const REVIEWS_TABLE  = 'tblZq8VBiA4MLmVJj'
const ITEMS_TABLE    = 'tblS2393EZKtDJA76'
const TOKEN          = import.meta.env.VITE_AIRTABLE_TOKEN
const API_URL        = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`
const REVIEWS_URL    = `https://api.airtable.com/v0/${BASE_ID}/${REVIEWS_TABLE}`
const ITEMS_URL      = `https://api.airtable.com/v0/${BASE_ID}/${ITEMS_TABLE}`

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type':  'application/json',
}

export interface BookingData {
  name:    string
  phone:   string
  service: string
  date:    string
  time:    string
}

// Submit a new quote request (Status: Pending)
export async function submitBooking(data: BookingData): Promise<void> {
  await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      fields: {
        Name:    data.name,
        Phone:   data.phone,
        Service: data.service,
        Date:    data.date,
        Time:    data.time,
        Status:  'Pending',
      },
    }),
  })
}

// Fetch all dates with Status = "Reserved"
export async function fetchReservedDates(): Promise<string[]> {
  const url = `${API_URL}?filterByFormula=${encodeURIComponent('{Status}="Reserved"')}`
  const res  = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } })
  const json = await res.json()
  return (json.records ?? [])
    .map((r: { fields: { Date?: string } }) => r.fields.Date)
    .filter(Boolean) as string[]
}

export type BookingStatus = 'Pending' | 'Reserved' | 'Cancelled'

export interface Booking {
  id:      string
  name:    string
  phone:   string
  service: string
  date:    string
  time:    string
  status:  BookingStatus
}

// Fetch all bookings sorted by date descending
export async function fetchAllBookings(): Promise<Booking[]> {
  const url = `${API_URL}?sort[0][field]=Date&sort[0][direction]=desc`
  const res  = await fetch(url, { headers })
  const json = await res.json()
  return (json.records ?? []).map((r: { id: string; fields: Record<string, string> }) => ({
    id:      r.id,
    name:    r.fields.Name    ?? '',
    phone:   r.fields.Phone   ?? '',
    service: r.fields.Service ?? '',
    date:    r.fields.Date    ?? '',
    time:    r.fields.Time    ?? '',
    status:  (r.fields.Status as BookingStatus) ?? 'Pending',
  }))
}

// Update booking status
export async function updateBookingStatus(id: string, status: BookingStatus): Promise<void> {
  await fetch(`${API_URL}/${id}`, {
    method:  'PATCH',
    headers,
    body:    JSON.stringify({ fields: { Status: status } }),
  })
}

// Delete a booking
export async function deleteBooking(id: string): Promise<void> {
  await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers })
}

// ── Reviews ───────────────────────────────────────────────

export interface Review {
  id:      string
  name:    string
  rating:  number
  comment: string
  status?: string
  image?:  string
}

function mapReview(r: { id: string; fields: Record<string, string | number> }): Review {
  return {
    id:      r.id,
    name:    (r.fields.Name    as string) || 'Anonymous',
    rating:  (r.fields.Rating  as number) || 5,
    comment: (r.fields.Comment as string) || '',
    status:  (r.fields.Status  as string) || 'Pending',
    image:   (r.fields.Image   as string) || '',
  }
}

export async function fetchApprovedReviews(): Promise<Review[]> {
  const url = `${REVIEWS_URL}?filterByFormula=${encodeURIComponent('{Status}="Approved"')}`
  const res  = await fetch(url, { headers })
  const json = await res.json()
  return (json.records ?? [])
    .map(mapReview)
    .filter((r: Review) => r.status === 'Approved')
}

export async function fetchAllReviews(): Promise<Review[]> {
  const res  = await fetch(REVIEWS_URL, { headers })
  const json = await res.json()
  return (json.records ?? []).map(mapReview)
}

export async function updateReviewStatus(id: string, status: 'Approved' | 'Rejected' | 'Pending'): Promise<void> {
  const res = await fetch(`${REVIEWS_URL}/${id}`, {
    method:  'PATCH',
    headers,
    body:    JSON.stringify({ fields: { Status: status } }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `Failed to update status (${res.status})`)
  }
}

export async function updateReviewImage(id: string, image: string): Promise<void> {
  const res = await fetch(`${REVIEWS_URL}/${id}`, {
    method:  'PATCH',
    headers,
    body:    JSON.stringify({ fields: { Image: image } }),
  })
  if (!res.ok) throw new Error('Failed to save image')
}

export async function submitReview(data: { name: string; rating: number; comment: string; image?: string }): Promise<void> {
  const fields: Record<string, string | number> = {
    Name:    data.name || 'Anonymous',
    Rating:  data.rating,
    Comment: data.comment,
    Status:  'Pending',
  }
  if (data.image) fields['Image'] = data.image
  await fetch(REVIEWS_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ fields }),
  })
}

// ── Item Prices ───────────────────────────────────────────────

export interface ItemPrice {
  id:    string
  name:  string
  price: number
}

export async function fetchItemPrices(): Promise<ItemPrice[]> {
  const res  = await fetch(ITEMS_URL, { headers })
  const json = await res.json()
  return (json.records ?? []).map((r: { id: string; fields: Record<string, string> }) => ({
    id:    r.id,
    name:  r.fields.Name  ?? '',
    price: Number(r.fields.Price) || 0,
  }))
}

export async function updateItemPrice(id: string, price: number): Promise<void> {
  await fetch(`${ITEMS_URL}/${id}`, {
    method:  'PATCH',
    headers,
    body:    JSON.stringify({ fields: { Price: String(price) } }),
  })
}

export async function createItemRecord(name: string, price: number): Promise<ItemPrice> {
  const res  = await fetch(ITEMS_URL, {
    method:  'POST',
    headers,
    body:    JSON.stringify({ fields: { Name: name, Price: String(price) } }),
  })
  const json = await res.json()
  return { id: json.id, name, price }
}

// Create a booking manually (admin)
export async function createBooking(data: BookingData & { status: BookingStatus }): Promise<Booking> {
  const res  = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      fields: {
        Name:    data.name,
        Phone:   data.phone,
        Service: data.service,
        Date:    data.date,
        Time:    data.time,
        Status:  data.status,
      },
    }),
  })
  const json = await res.json()
  return {
    id:      json.id,
    name:    json.fields.Name    ?? '',
    phone:   json.fields.Phone   ?? '',
    service: json.fields.Service ?? '',
    date:    json.fields.Date    ?? '',
    time:    json.fields.Time    ?? '',
    status:  json.fields.Status  ?? 'Pending',
  }
}
