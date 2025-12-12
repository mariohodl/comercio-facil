import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import CashRegisterSession from '@/lib/db/models/cash-register.model'
import { CloseRegisterSchema } from '@/lib/validator'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const validation = CloseRegisterSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { message: validation.error.errors[0].message },
                { status: 400 }
            )
        }

        await connectToDatabase()

        // Find the open session
        const currentSession = await CashRegisterSession.findOne({
            storeId: body.storeId,
            userId: session.user.id,
            status: 'open'
        })

        if (!currentSession) {
            return NextResponse.json(
                { message: 'No open cash register session found.' },
                { status: 404 }
            )
        }

        currentSession.closingAmount = validation.data.closingAmount
        currentSession.closedAt = new Date()
        currentSession.status = 'closed'

        await currentSession.save()

        return NextResponse.json(
            { message: 'Cash register closed successfully', session: currentSession },
            { status: 200 }
        )

    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
    }
}
