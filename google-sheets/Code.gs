// Google Apps Script: receives bookings from the Stripe webhook and adds a row.
// Setup steps are in google-sheets/README.md

const SECRET = 'CHANGE-ME' // must match GOOGLE_SHEET_SECRET in Netlify
const HEADERS = ['Received', 'Name', 'Items', 'Date', 'Time', 'Location', 'Payment', 'Amount Paid', 'Stripe Session']

function doPost(e) {
  const data = JSON.parse(e.postData.contents)
  if (data.secret !== SECRET) return ContentService.createTextOutput('forbidden')

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS)
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold')
    sheet.setFrozenRows(1)
  }

  // Stripe can resend an event; skip a session we already saved
  const ids = sheet.getLastRow() > 1 ? sheet.getRange(2, 9, sheet.getLastRow() - 1, 1).getValues().flat() : []
  if (data.sessionId && ids.indexOf(data.sessionId) !== -1) return ContentService.createTextOutput('duplicate')

  sheet.appendRow([
    new Date(), data.name, data.items, data.date, data.time,
    data.location, data.payment, data.amount, data.sessionId,
  ])
  return ContentService.createTextOutput('ok')
}
