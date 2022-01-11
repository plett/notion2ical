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
    var vevent = new ICAL.Component('vevent');
    var e = new ICAL.Event(vevent);
    e.summary = data.results[i].properties.Name.title[0].plain_text

    cal.addSubcomponent(vevent);
  }

  return new Response(cal.toString(), {
    headers: { 'content-type': 'text/plain' },
  })
}
