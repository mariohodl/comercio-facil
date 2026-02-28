import { connectToDatabase } from './lib/db';
import Product from './lib/db/models/product.model';
import mongoose from 'mongoose';

const storeId = "admin_store_id"; // I need to find the user's store ID.

async function seed() {
  await connectToDatabase();
  console.log("Connected to DB");
}
seed();
