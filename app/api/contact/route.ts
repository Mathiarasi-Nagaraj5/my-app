import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import ContactMessage from "@/app/models/ContactMessage";
import { isInquiryType } from "../../../app/lib/contactTypes";
import type { InquiryType } from "../../../app/lib/contactTypes";

interface ContactBody {
  name: string;
  email: string;
  inquiryType: InquiryType;
  message: string;
  website: string; // honeypot, real users leave this empty
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseBody(raw: unknown): ContactBody | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;

  const name = typeof r.name === "string" ? r.name.trim() : "";
  const email = typeof r.email === "string" ? r.email.trim() : "";
  const message = typeof r.message === "string" ? r.message.trim() : "";
  const website = typeof r.website === "string" ? r.website : "";

  if (!isInquiryType(r.inquiryType)) return null;
  if (name.length < 2 || name.length > 100) return null;
  if (!EMAIL_RE.test(email)) return null;
  if (message.length < 5 || message.length > 2000) return null;

  return { name, email, inquiryType: r.inquiryType, message, website };
}

export async function POST(req: Request): Promise<NextResponse> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const body = parseBody(raw);
  if (!body) {
    return NextResponse.json(
      { error: "Please check your details and try again." },
      { status: 400 }
    );
  }

  // Bots fill the hidden field: pretend success, save nothing.
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  try {
    await connectDB();
    await ContactMessage.create({
      name: body.name,
      email: body.email,
      inquiryType: body.inquiryType,
      message: body.message,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not send your message. Please try again." },
      { status: 500 }
    );
  }
}