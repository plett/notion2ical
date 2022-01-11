import * as ICAL from 'ical.js'

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  const myfilter = {
    filter: {
      property: 'Date',
      number: {
        is_not_empty: true
      }
    }
  }
  const resp = await fetch('https://api.notion.com/v1/databases/195f7bad7de34dd8a9ced504ea101e84/query', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': "2021-08-16"
    },
    body: JSON.stringify(myfilter)
  })

  const data = await resp.json()

  var cal = new ICAL.Component(['vcalendar', [], []]);

  for (let i in data.results) {
    const n = data.results[i]; // notion event
    var vevent = new ICAL.Component('vevent');
    var e = new ICAL.Event(vevent);
    if(!n.id || !n.created_time) {
      // these are all required in ical, skip if not present
      continue;
    }
    e.uid = n.id;

    // https://icalendar.org/iCalendar-RFC-5545/3-8-7-2-date-time-stamp.html
    // In the case of an iCalendar object that doesn't specify a "METHOD"
    // property, this property specifies the date and time that the information
    // associated with the calendar component was last revised in the calendar
    // store.
    vevent.addPropertyWithValue('dtstamp', ICAL.Time.fromString(n.last_edited_time));

    const d = n.properties["Date"].date || null

    if (d && d.start) {
      e.startDate = ICAL.Time.fromString(d.start)
    } else {
      //start date is a required field, skip if it's not there
      continue
    }
    if (d && d.end) {
      e.endDate = ICAL.Time.fromString(d.end)
    }
    // TODO time_zone?

    if (n.url) {
      // ical.js doesn't know about "new" RFC7986 url, so, set it manually
      vevent.addPropertyWithValue('url', n.url);
    }

    e.summary = n.properties.Name.title[0].plain_text

    cal.addSubcomponent(vevent);
  }

  cal.addPropertyWithValue('version', '2.0')
  cal.addPropertyWithValue('prodid', 'https://github.com/plett/notion2ical')

  return new Response(cal.toString(), {
    headers: { 'content-type': 'text/calendar' },
  })
}
