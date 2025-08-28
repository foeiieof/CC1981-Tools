import '@testing-library/jest-dom'
import 'whatwg-fetch'
import { server } from './server'
import { TextEncoder, TextDecoder } from 'util'

// if (typeof globalThis.TextEncoder === 'undefined') {
//   globalThis.TextEncoder = TextEncoder
// }
// if (typeof globalThis.TextDecoder === 'undefined') {
//   globalThis.TextDecoder = TextDecoder
// }


beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

global.fetch = global.fetch || ""

