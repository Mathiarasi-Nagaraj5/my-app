import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

/**
 * POST /api/upload
 *
 * Accepts multipart/form-data with one or more "file"/"files" fields.
 * Maximum 5 images per request, each ≤ 5 MB.
 *
 * Returns: { imageUrls: string[] }
 *
 * Files are stored in Vercel Blob.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Support both single "file" and multiple "files[]" field names
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

    if (rawFiles.length > 5) {
      return NextResponse.json(
        { error: "Maximum 5 images allowed per product" },
        { status: 400 }
      );
    }

    // Validate all files before uploading
    for (const file of rawFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            error: `File "${file.name}" is not a supported image type (jpg, png, webp, gif)`,
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `File "${file.name}" exceeds the 5 MB limit`,
          },
          { status: 400 }
        );
      }
    }

    const imageUrls: string[] = [];

    for (const file of rawFiles) {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";

      const filename = `products/${randomUUID()}.${ext}`;

      const blob = await put(filename, file, {
        access: "public",
      });

      imageUrls.push(blob.url);
    }

    return NextResponse.json(
      {
        imageUrls,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /api/upload error:", err);

    return NextResponse.json(
      {
        error: "Upload failed. Please try again.",
      },
      { status: 500 }
    );
  }
}