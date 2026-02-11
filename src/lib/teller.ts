import fs from 'fs'
import type { IncomingMessage } from 'http'
import https from 'https'
import path from 'path'

const TELLER_BASE_URL = 'https://api.teller.io'

let cachedAgent: https.Agent | null = null

const getEnvironment = () =>
  process.env.TELLER_ENV || process.env.NEXT_PUBLIC_TELLER_ENV || 'sandbox'

const readPemValue = (value?: string | null, filePath?: string | null) => {
  if (value) return value
  if (!filePath) return null
  const resolvedPath = path.resolve(filePath)
  return fs.readFileSync(resolvedPath, 'utf8')
}

const getTellerAgent = () => {
  if (cachedAgent) return cachedAgent

  const environment = getEnvironment()
  if (environment === 'sandbox') return null

  const cert = readPemValue(
    process.env.TELLER_CERT,
    process.env.TELLER_CERT_PATH
  )
  const key = readPemValue(process.env.TELLER_KEY, process.env.TELLER_KEY_PATH)

  if (!cert || !key) {
    throw new Error(
      'Teller mTLS credentials are required for development/production.'
    )
  }

  cachedAgent = new https.Agent({
    cert,
    key,
  })

  return cachedAgent
}

const buildAuthHeader = (accessToken: string) => {
  const basicToken = Buffer.from(`${accessToken}:`).toString('base64')
  return `Basic ${basicToken}`
}

const readResponseBody = (response: IncomingMessage) =>
  new Promise<string>((resolve) => {
    let body = ''
    response.on('data', (chunk) => {
      body += chunk
    })
    response.on('end', () => {
      resolve(body)
    })
  })

export async function tellerFetch<T>(
  pathName: string,
  accessToken: string,
  init?: RequestInit
): Promise<T> {
  const agent = getTellerAgent()
  const headers = new Headers(init?.headers)
  headers.set('Authorization', buildAuthHeader(accessToken))
  headers.set('Content-Type', 'application/json')

  const url = new URL(`${TELLER_BASE_URL}${pathName}`)
  const method = init?.method ? init.method.toUpperCase() : 'GET'
  const body = init?.body

  const response = await new Promise<IncomingMessage>((resolve, reject) => {
    const request = https.request(
      url,
      {
        method,
        headers: Object.fromEntries(headers.entries()),
        agent: agent ?? undefined,
      },
      (res) => resolve(res)
    )

    request.on('error', reject)

    if (body) {
      if (typeof body === 'string' || body instanceof Uint8Array) {
        request.write(body)
      } else {
        request.write(String(body))
      }
    }

    request.end()
  })

  const responseBody = await readResponseBody(response)
  const statusCode = response.statusCode ?? 500

  if (statusCode < 200 || statusCode >= 300) {
    throw new Error(`Teller error ${statusCode}: ${responseBody}`)
  }

  if (!responseBody) {
    return {} as T
  }

  return JSON.parse(responseBody) as T
}

export const getTellerEnvironment = getEnvironment
