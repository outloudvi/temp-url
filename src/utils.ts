import words from 'nanoid-dictionary/nolookalikes-safe'
import { customAlphabet } from 'nanoid'

import type { ShortenItem } from './types'

import staticList from './static'
import { TTL, SITE_URL, INITIAL_LENGTH } from './conf'

const nanoid = customAlphabet(words, INITIAL_LENGTH)

export function tryParse(txt: string): any {
  try {
    return JSON.parse(txt)
  } catch (_) {
    return null
  }
}

export async function giveRandomPath(): Promise<string> {
  let rnd = nanoid().toUpperCase()
  let cnt = INITIAL_LENGTH + 1
  while (1) {
    if (!staticList[rnd] && (await KV.get(rnd)) === null) break
    rnd = customAlphabet(words, cnt++)().toUpperCase()
    if (cnt == INITIAL_LENGTH * 2) {
      cnt = INITIAL_LENGTH + 1
    }
  }
  return rnd
}

export function getInfo(tag: string): Response {
  switch (tag) {
    case 'info': {
      return new Response(
        JSON.stringify({
          initialLength: INITIAL_LENGTH,
          ttl: TTL,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
    }
    default: {
      return new Response('', {
        status: 204,
      })
    }
  }
}

export async function writeItem(
  key: string,
  item: ShortenItem,
  from: string = SITE_URL,
) {
  const curr = await KV.get(key)
  if (curr !== null) {
    return new Response('current result not expired', {
      status: 403,
    })
  }
  await KV.put(key, JSON.stringify(item), { expirationTtl: TTL })
  const url = new URL(from)
  url.pathname = key
  return new Response(String(url))
}

export function tryParseUrl(url: string): string | null {
  if (isValidUrl(url)) return url
  if (isValidUrl('http://' + url)) return 'http://' + url
  return null
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch (_) {}
  return false
}
