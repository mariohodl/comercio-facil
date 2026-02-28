import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { MOCK_SELLERS } from '@/lib/mocks/data';
import { connectToDatabase } from '@/lib/db';
import User from '@/lib/db/models/user.model';
import Store from '@/lib/db/models/store.model';

// GET /api/sellers?companyId=xxx&storeId=yyy — returns sellers for a company or store (with PIN set indicator)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const companyId = searchParams.get('companyId');
        const storeId = searchParams.get('storeId');

        if (!companyId && !storeId) {
            return NextResponse.json({ error: 'companyId o storeId es requerido' }, { status: 400 });
        }

        await connectToDatabase();

        // Check if we can resolve companyId from storeId if missing
        let effectiveCompanyId = companyId;
        if (!effectiveCompanyId && storeId) {
            const store = await Store.findOne({ slug: storeId });
            if (store) {
                effectiveCompanyId = store.company.toString();
            }
        }

        if (!effectiveCompanyId) {
            return NextResponse.json({ error: 'No se pudo identificar la empresa' }, { status: 400 });
        }

        // Mock data for demo company (Bypass auth for offline/demo mode)
        if (effectiveCompanyId === 'demo-company' || storeId === 'demo-store') {
            return NextResponse.json({
                sellers: MOCK_SELLERS.map(s => ({
                    _id: s._id,
                    name: s.name,
                    email: s.email,
                    image: s.image,
                    hasPin: true
                }))
            });
        }

        // NOTE: Session check removed to allow listing sellers on the login screen
        // Security: We only return safe public fields (name, image, hasPin)

        console.log(`Buscando vendedores para Empresa/Tienda:`, { effectiveCompanyId, storeId });

        const sellers = await User.find(
            {
                'business.companyId': effectiveCompanyId,
                role: 'Seller',
                isDeleted: { $ne: true },
                status: true,
            },
            { name: true, image: true, pin: true, _id: true }
        ).lean();

        console.log(`Vendedores encontrados: ${sellers.length}`);

        // Return sellers with a boolean indicating if they have a PIN set (never the hash)
        const safeSellers = sellers.map((s: any) => ({
            _id: s._id.toString(),
            name: s.name,
            image: s.image,
            hasPin: !!s.pin,
        }));

        const response = NextResponse.json({ sellers: safeSellers });

        // Prevent aggressive caching of the sellers list
        response.headers.set('Cache-Control', 'no-store, max-age=0');

        return response;
    } catch (error) {
        console.error('Error fetching sellers:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
