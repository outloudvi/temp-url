interface ShortenText {
  type: 'txt'
  payload: string
}

interface ShortenLink {
  type: 'url'
  payload: string
}

export type ShortenItem = ShortenText | ShortenLink
