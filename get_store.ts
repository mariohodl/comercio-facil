import { connectToDatabase } from './lib/db';
import Store from './lib/db/models/store.model';

async function run() {
  await connectToDatabase();
  const stores = await Store.find();
  console.log("Stores:", stores.map(s => s._id));
  process.exit(0);
}
run();
