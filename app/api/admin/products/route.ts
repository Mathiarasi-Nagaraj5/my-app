import { NextResponse } from "next/server";
import  connectDB  from "../../../lib/mongodb";
import { verifyAdminToken } from "../../../lib/adminAuth";
import Product from "../../../models/Product";

function getToken(req: Request) {
  return req.headers.get("cookie")?.match(/admin_session=([^;]+)/)?.[1];
}

export async function POST(req: Request) {
  // if (!verifyAdminToken(getToken(req))) {
  //   return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  // }

  try {
    await connectDB();
    const body = await req.json();

    const product = await Product.create({
      name: body.name,
      slug: body.slug,
      category: body.category,
      price: body.price,
      originalPrice: body.originalPrice || undefined,
      imageUrl: body.imageUrl,
      isBestseller: body.isBestseller,
      sizes: body.sizes ? body.sizes.split(",").map((s: string) => s.trim()) : [],
      colors: body.colors
        ? body.colors.split(",").map((c: string) => c.trim()).filter(Boolean)
        : [],
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "a product with this slug already exists" }, { status: 409 });
    }
    console.error("POST /api/admin/products error:", error);
    return NextResponse.json({ error: "failed to create product" }, { status: 500 });
  }
}
