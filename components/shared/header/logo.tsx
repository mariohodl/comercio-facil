import Image from 'next/image'
import Link from 'next/link'
import { APP_NAME } from '@/lib/constants'

export default function Logo() {
    return (
        <Link href='/' className='flex items-center gap-2'>
            <Image
                src='/images/logo.jpg'
                alt={`${APP_NAME} logo`}
                height={50}
                width={50}
                priority={true}
                className='object-contain'
            />
            <span className='font-bold text-lg'>{APP_NAME}</span>
        </Link>
    )
}
