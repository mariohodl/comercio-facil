import Link from 'next/link'
import Image from 'next/image'
import { APP_NAME } from '@/lib/constants'

export default function Logo() {
    return (
        <Link href='/'>
            <Image
                src='/images/app-logo.png'
                alt={APP_NAME}
                height={40}
                width={190}
                priority
                className='object-contain'
            />
        </Link>
    )
}
