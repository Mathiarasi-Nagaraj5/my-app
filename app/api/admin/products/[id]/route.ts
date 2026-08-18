import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Product from "@/app/models/Product";
// import { verifyAdminToken } from "@/app/lib/adminAuth";

// function getToken(req: Request) {
//   return req.headers.get("cookie")?.match(/admin_session=([^;]+)/)?.[1];
// }

/**
 * POST /api/admin/products
 *
 * Creates a new product in MongoDB.
 *
 * Expected JSON body:
 * {
 *   name:          string          required
 *   slug:          string          required, unique
 *   category:      string          required  (t-shirts | hoodies | pyjamas)
 *   price:         number          required
 *   originalPrice: number          optional
 *   stock:         number          required
 *   imageUrls:        string[]        required, 1–5 URLs (already uploaded via /api/upload)
 *   isBestseller:  boolean         optional
 *   sizes:         string          comma-separated e.g. "S, M, L, XL"
 *   colors:        string          comma-separated hex codes e.g. "#fff, #000"
 * }
 *
 * Response 201: saved product document
 * Response 400: validation error
 * Response 409: slug already exists
 * Response 500: server error
 */
export async function POST(req: Request) {
  // Uncomment when auth is ready:
  // if (!verifyAdminToken(getToken(req))) {
  //   return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  // }

  try {
    await connectDB();
    const body = await req.json();

    // ── Validate required fields ────────────────────────────────────────────
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }
    if (!body.slug?.trim()) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }
    if (!body.price || Number(body.price) <= 0) {
      return NextResponse.json({ error: "A valid price is required" }, { status: 400 });
    }
    if (!Array.isArray(body.imageUrls) || body.imageUrls.length === 0) {
      return NextResponse.json(
        { error: "At least one product image is required" },
        { status: 400 }
      );
    }
    if (body.imageUrls.length > 5) {
      return NextResponse.json(
        { error: "Maximum 5 imageUrls allowed per product" },
        { status: 400 }
      );
    }

    // ── Parse comma-separated strings sent from the form ───────────────────
    const sizes: string[] = body.sizes
      ? String(body.sizes).split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];

    const colors: string[] = body.colors
      ? String(body.colors).split(",").map((c: string) => c.trim()).filter(Boolean)
      : [];

    // ── Create document ─────────────────────────────────────────────────────
   console.log("Creating product with data:",body);
   
    const product = await Product.create({
      name: body.name.trim(),
      slug: body.slug.trim().toLowerCase(),
      category: body.category,
      price: Number(body.price),
      originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
      stock: Number(body.stock ?? 0),
      imageUrls: body.imageUrls,
      isBestseller: Boolean(body.isBestseller),
      sizes,
      colors,
    });

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "A product with this slug already exists" },
        { status: 409 }
      );
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      return NextResponse.json({ error: messages.join(", ") }, { status: 400 });
    }
    console.error("POST /api/admin/products error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

/**
 * GET /api/admin/products
 *
 * Lists all products (admin view — includes stock).
 * Sorted by newest first.
 */
export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ data: products }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}