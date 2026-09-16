// File: app/api/uploads/route.ts
import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const PRODUCT_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const HERO_ALLOWED_TYPES = ["image/png"];

const REVIEW_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_PER_TYPE: Record<string, number> = {
  hero: 1,
  product: 5,
  review: 3,
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const uploadType = formData.get("type")?.toString() ?? "product";

    const rawFiles = [
      ...formData.getAll("file"),
      ...formData.getAll("files"),
      ...formData.getAll("files[]"),
    ].filter((f): f is File => f instanceof File);

    if (rawFiles.length === 0) {
      return NextResponse.json(
        { error: "No files received" },
        { status: 400 }
      );
    }

    const max = MAX_PER_TYPE[uploadType] ?? 5;
    if (rawFiles.length > max) {
      return NextResponse.json(
        {
          error:
            uploadType === "hero"
              ? "Only one hero image can be uploaded at a time"
              : `Maximum ${max} images allowed`,
        },
        { status: 400 }
      );
    }

    const allowedTypes =
      uploadType === "hero"
        ? HERO_ALLOWED_TYPES
        : uploadType === "review"
        ? REVIEW_ALLOWED_TYPES
        : PRODUCT_ALLOWED_TYPES;

    for (const file of rawFiles) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          {
            error:
              uploadType === "hero"
                ? `"${file.name}" is not a PNG image. Hero images must be PNG only.`
                : `"${file.name}" is not a supported image type.`,
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `"${file.name}" exceeds the 5 MB limit`,
          },
          { status: 400 }
        );
      }
    }

    const folder =
      uploadType === "hero" ? "hero" : uploadType === "review" ? "reviews" : "products";

    const imageUrls: string[] = [];

    for (const file of rawFiles) {
      const filename = `${folder}/${randomUUID()}.png`;

      const blob = await put(filename, file, {
        access: "public",
        storeId: process.env.BLOB_READ_WRITE_TOKEN_STORE_ID,
      });

      imageUrls.push(blob.url);
    }

    return NextResponse.json(
      {
        success: true,
        imageUrls, // ProductForm / ReviewForm read this
        url: imageUrls[0], // SiteContentEditor reads this
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /api/uploads error:", err);

    return NextResponse.json(
      {
        success: false,
        error: "Upload failed. Please try again.",
        message: "Upload failed. Please try again.",
      },
      { status: 400 }
    );
  }
}