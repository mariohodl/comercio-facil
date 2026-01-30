import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { UploadThingError, UTApi } from 'uploadthing/server'
import { auth } from '@/auth'
import { addProductImg } from '../../../lib/actions/product.actions'
import { UPLOADTHING_TOKEN } from '@/lib/constants'

export const utapi = new UTApi({
  token: UPLOADTHING_TOKEN,
})
const f = createUploadthing()

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 10 } })
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
    // eslint-disable removed
    .onUploadComplete(async ({ metadata, file }) => {

      if (metadata.productId && metadata.productId !== 'create') {
        // Check if productId is a valid MongoDB ObjectId (24 hex characters)
        const isValidId = /^[0-9a-fA-F]{24}$/.test(metadata.productId);
        if (isValidId) {
          const fileUrl = (file as any).ufsUrl || file.url;
          const productUpdated = await addProductImg(metadata.productId, fileUrl, file.key)
          console.log(productUpdated)
        }
      }
      return { uploadedBy: metadata.userId }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter