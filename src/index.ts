import { handleRequest } from './handler'

addEventListener('fetch', (event) => {
  try {
    event.respondWith(handleRequest(event.request))
  } catch (e) {
    console.log('ERRR', String(e), event.request)
  }
})
