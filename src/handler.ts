import {
  tryParseUrl,
  writeItem,
  giveRandomPath,
  getInfo,
  tryParse,
} from './utils'

import type { ShortenItem } from './types'

import staticList from './static'
import { SITE_URL } from './conf'

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url)

  // Return index page
  if (url.pathname === '/' && request.method === 'GET') {
    return new Response(STATIC['index.html'], {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  }

  if (url.pathname === '/') {
    // Data write
    if (request.method === 'POST') {
      const referer = url.origin
      const target: ShortenItem = await request.json().catch(() => ({}))
      if (
        ((target as any).type !== 'txt' && (target as any).type !== 'url') ||
        typeof (target as any).payload !== 'string'
      ) {
        return new Response('bad data', {
          status: 400,
        })
      }
      if (target.type === 'url') {
        let triedUrl = tryParseUrl(target.payload)
        if (triedUrl === null) {
          return new Response(`invalid url: ${target.payload}`, {
            status: 400,
          })
        }
      }
      return await writeItem(await giveRandomPath(), target, referer)
    } else {
      return new Response('bad method', {
        status: 405,
      })
    }
  }

  // Dat read
  const key = url.pathname.replace(/\//, '').toUpperCase()
  if (request.method === 'GET') {
    if (key.split('/').length !== 1) {
      const infoTag = key.split('/').slice(1).join('/')
      return getInfo(infoTag)
    }
    if (key.startsWith('_')) {
      // pro key
      url.host = 'pro.uau.li'
      url.pathname = url.pathname.replace(/^\/_/, '/')
      return new Response(String(url), {
        status: 302,
        headers: {
          Location: String(url),
        },
      })
    }
    if (staticList[key])
      return new Response(staticList[key], {
        status: 302,
        headers: {
          Location: staticList[key],
        },
      })
    const ret = await KV.get(key)
    if (ret === null) {
      return new Response('not found', {
        status: 404,
      })
    }
    const item: ShortenItem = tryParse(ret)
    if (item.type === 'url') {
      return new Response(item.payload, {
        status: 302,
        headers: {
          Location: item.payload,
        },
      })
    } else {
      return new Response(item.payload)
    }
  } else {
    return new Response(
      `bad method. POST ${SITE_URL} to create a new redirect`,
      {
        status: 405,
      },
    )
  }
}
