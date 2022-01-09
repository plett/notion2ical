addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  const resp = await fetch('https://api.notion.com/v1/databases/195f7bad7de34dd8a9ced504ea101e84/query', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': "2021-08-16"
    }
  })

  const data = await resp.json()

  return new Response(JSON.stringify(data), {
    headers: { 'content-type': 'application/json' },
  })
}
