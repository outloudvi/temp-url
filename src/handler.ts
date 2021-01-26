const TTL = 300

const SITE_URL = 'https://uau.li'

async function writeUrl(key: string, dest: string, from: string = SITE_URL) {
  const curr = await KV.get(key)
  if (curr !== null) {
    return new Response('current result not expired', {
      status: 403,
    })
  }
  await KV.put(key, dest, { expirationTtl: TTL })
  const url = new URL(from)
  url.pathname = key
  return new Response(String(url))
}

function giveRandomPath(): string {
  return String(Math.random()).slice(2, 6)
}

function tryParseUrl(url: string): string | null {
  if (isValidUrl(url)) return url
  if (isValidUrl('http://' + url)) return 'http://' + url
  return null
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch (_) {}
  return false
}

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const referer = url.origin
  const target = url.searchParams.get('t')
  if (url.pathname === '/') {
    // Main page
    if (request.method === 'GET') {
      return new Response(STATIC['index.html'], {
        headers: {
          'Content-Type': 'text/html',
        },
      })
    } else if (request.method === 'POST') {
      if (target === null) {
        return new Response('no target, use t=url to set the target', {
          status: 400,
        })
      }
      let triedUrl = tryParseUrl(target)
      if (triedUrl === null) {
        return new Response(`invalid url: ${target}`, {
          status: 400,
        })
      }
      return await writeUrl(giveRandomPath(), triedUrl, referer)
    } else {
      return new Response('bad method', {
        status: 405,
      })
    }
  }
  const key = url.pathname.replace(/\//, '')
  if (request.method === 'GET') {
    const ret = await KV.get(key)
    if (ret === null) {
      return new Response('not found', {
        status: 404,
      })
    }
    return new Response(ret, {
      status: 302,
      headers: {
        Location: ret,
      },
    })
  } else {
    return new Response(
      `bad method. POST ${SITE_URL} to create a new redirect`,
      {
        status: 405,
      },
    )
  }
}
