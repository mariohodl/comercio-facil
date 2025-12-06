import { connectToDatabase } from './lib/db';
import User from './lib/db/models/user.model';
import Company from './lib/db/models/company.model';
import Warehouse from './lib/db/models/warehouse.model';
import { loadEnvConfig } from '@next/env';
import { cwd } from 'process';

loadEnvConfig(cwd());

const main = async () => {
    try {
        await connectToDatabase(process.env.MONGODB_URI);

        const email = 'mario@example.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User ${email} not found`);
            return;
        }

        console.log('User:', JSON.stringify(user, null, 2));

        if (user.business?.companyId) {
            const company = await Company.findById(user.business.companyId);
            console.log('Company:', JSON.stringify(company, null, 2));

            const warehouses = await Warehouse.find({ company: user.business.companyId });
            console.log('Warehouses for Company:', JSON.stringify(warehouses, null, 2));
        } else {
            console.log('User has no companyId in business object');
        }

        const allWarehouses = await Warehouse.find({});
        console.log('All Warehouses in DB:', JSON.stringify(allWarehouses, null, 2));

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

main();
