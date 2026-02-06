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
            // console.log(`User ${email} not found`);
            return;
        }


        if (user.business?.companyId) {
            const company = await Company.findById(user.business.companyId);

            const warehouses = await Warehouse.find({ company: user.business.companyId });
        } else {
        }

        const allWarehouses = await Warehouse.find({});

        process.exit(0);
    } catch (error) {
        // console.error(error);
        process.exit(1);
    }
};

main();
