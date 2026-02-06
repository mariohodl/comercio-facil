import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import CashRegisterSession from '@/lib/db/models/cash-register.model'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
    try {
        const session = await auth()
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const storeId = searchParams.get('storeId')

        if (!storeId) {
            return NextResponse.json({ message: 'Store ID is required' }, { status: 400 })
        }

        await connectToDatabase()

        const currentSession = await CashRegisterSession.findOne({
            storeId: storeId, // Ensure this matches Schema type (ObjectId)
            userId: session.user.id,
            status: 'open'
        })

        return NextResponse.json({ session: currentSession || null }, { status: 200 })

    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
    }
}
