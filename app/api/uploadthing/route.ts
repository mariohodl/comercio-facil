import { createRouteHandler } from 'uploadthing/next'

import { ourFileRouter } from './core'
import { UPLOADTHING_TOKEN } from '@/lib/constants'

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,

  config: {
    token: UPLOADTHING_TOKEN,
  },
})