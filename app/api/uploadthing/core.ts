import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { UploadThingError, UTApi } from 'uploadthing/server'
import { auth } from '@/auth'
import { addProductImg } from '../../../lib/actions/product.actions'

export const utapi = new UTApi()
const f = createUploadthing()

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: '4MB' } })
    // Set permissions and file types for this FileRoute
    .middleware(async (context) => {
      const splittedValues = context.req.headers.get('referer')?.split('/');
      const idValue = splittedValues?.[splittedValues.length - 1] || '';
      // This code runs on your server before upload
      const session = await auth()

      // If you throw, the user will not be able to upload
      if (!session) throw new UploadThingError('Unauthorized')
      // const params = useSearchParams()
        // console.log('PIDDD',params.get('id'))
      
      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: session?.user?.id, productId: idValue }
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      const productUpdated = await addProductImg( metadata.productId, file.ufsUrl, file.key)
      console.log(productUpdated)
      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter