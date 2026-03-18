const BASE_ID  = import.meta.env.VITE_AIRTABLE_BASE_ID
const TABLE_ID = import.meta.env.VITE_AIRTABLE_TABLE_ID
const TOKEN    = import.meta.env.VITE_AIRTABLE_TOKEN
const API_URL  = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`

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
