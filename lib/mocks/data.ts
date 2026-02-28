export const MOCK_ADMIN = {
    email: 'admin@comerciofacil.com',
    password: 'admin123', // In a real app we'd use hashes, but for the mock...
    name: 'Administrador Demo',
    role: 'Admin'
};

export const MOCK_SELLERS = [
    {
        _id: '65abc0000000000000000001',
        name: 'Juan Pérez',
        email: 'juan@comerciofacil.com',
        pin: '1234',
        role: 'Seller',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juan'
    },
    {
        _id: '65abc0000000000000000002',
        name: 'María García',
        email: 'maria@comerciofacil.com',
        pin: '5678',
        role: 'Seller',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria'
    }
];

export const MOCK_PRODUCTS = [
    {
        _id: 'p1',
        name: 'Coca Cola 600ml',
        price: 18.50,
        stock: 50,
        category: 'Bebidas',
        barcode: '7501055300075',
        image: 'https://placehold.co/400x400?text=Coca+Cola'
    },
    {
        _id: 'p2',
        name: 'Sabritas Sal 42g',
        price: 15.00,
        stock: 30,
        category: 'Botanas',
        barcode: '7501011115147',
        image: 'https://placehold.co/400x400?text=Sabritas'
    },
    {
        _id: 'p3',
        name: 'Leche Enterprise 1L',
        price: 26.00,
        stock: 20,
        category: 'Lácteos',
        barcode: '7501020512345',
        image: 'https://placehold.co/400x400?text=Leche'
    }
];
