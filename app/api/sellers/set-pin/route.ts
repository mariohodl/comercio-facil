import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import User from '@/lib/db/models/user.model';
import * as bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'Admin') {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { userId, pin } = await request.json();
        if (!userId || !pin) {
            return NextResponse.json({ error: 'userId y pin son requeridos' }, { status: 400 });
        }
        if (!/^\d{4}$/.test(pin)) {
            return NextResponse.json({ error: 'El PIN debe ser exactamente 4 dígitos' }, { status: 400 });
        }

        await connectToDatabase();

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        const hashedPin = await bcrypt.hash(pin, 10);
        await User.findByIdAndUpdate(userId, { pin: hashedPin });

        return NextResponse.json({ success: true, message: 'PIN actualizado correctamente' });
    } catch (error) {
        console.error('Error setting PIN:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
