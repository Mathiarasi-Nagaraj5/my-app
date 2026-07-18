import mongoose from "mongoose";
import dotenv from "dotenv";

import Product from "../app/models/Product";
import { products } from "../app/lib/product-data";

dotenv.config({ path: ".env" });

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    console.log("MongoDB Connected");

    await Product.deleteMany();

    console.log("Old products removed");

    await Product.insertMany(products);

    console.log("Products inserted successfully");

    process.exit(0);
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
}

seed();