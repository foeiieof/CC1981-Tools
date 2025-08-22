import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('api/channel-process-working', () => {
    return HttpResponse.json({
      status: 200,
      data: []
    })
  })
]

