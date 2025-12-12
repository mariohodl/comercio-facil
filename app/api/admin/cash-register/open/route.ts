import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import CashRegisterSession from '@/lib/db/models/cash-register.model'
import { OpenRegisterSchema } from '@/lib/validator'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const validation = OpenRegisterSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { message: validation.error.errors[0].message },
                { status: 400 }
            )
        }

        const { openingAmount } = validation.data
        const { storeId } = await req.json() // Expecting storeId in the body as well, although validated schema doesn't check it yet. Best to add it.

        await connectToDatabase()

        // Check if there is already an open session for this user/store
        const existingSession = await CashRegisterSession.findOne({
            storeId: body.storeId, // Using body.storeId directly
            userId: session.user.id,
            status: 'open'
        })

        if (existingSession) {
            return NextResponse.json(
                { message: 'You already have an open cash register session.' },
                { status: 400 }
            )
        }

        const newSession = new CashRegisterSession({
            storeId: body.storeId,
            userId: session.user.id,
            openingAmount,
            status: 'open',
            openedAt: new Date(),
            movements: []
        })

        await newSession.save()

        return NextResponse.json(
            { message: 'Cash register opened successfully', session: newSession },
            { status: 201 }
        )
    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
    }
}
