const TTL = 300

const SITE_URL = 'https://uau.li'
const INITIAL_LENGTH = 4

import { customAlphabet } from 'nanoid'

import words from 'nanoid-dictionary/nolookalikes-safe'

const nanoid = customAlphabet(words, INITIAL_LENGTH)

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

async function giveRandomPath(): Promise<string> {
  let rnd = nanoid()
  let cnt = INITIAL_LENGTH + 1
  while (1) {
    if ((await KV.get(rnd)) === null) break
    rnd = customAlphabet(words, cnt++)()
    if (cnt == INITIAL_LENGTH * 2) {
      cnt = INITIAL_LENGTH + 1
    }
  }
  return rnd.toUpperCase()
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
      return await writeUrl(await giveRandomPath(), triedUrl, referer)
    } else {
      return new Response('bad method', {
        status: 405,
      })
    }
  }
  const key = url.pathname.replace(/\//, '')
  if (request.method === 'GET') {
    const ret = await KV.get(key.toUpperCase())
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
