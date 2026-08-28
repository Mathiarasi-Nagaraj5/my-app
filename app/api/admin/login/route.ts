import { NextResponse } from "next/server";
import { generateAdminToken } from "../../../lib/adminAuth";
import process from "process";

export async function POST(req: Request) {
  const { password } = await req.json();
console.log("Admin login attempt", { password });
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    console.log("Incorrect password attempt for admin login", { password }, { sensitive: true },process.env.ADMIN_PASSWORD);  
    return NextResponse.json({ error: "incorrect password" }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set("admin_session", generateAdminToken(), {
    httpOnly: true, // not readable by client-side JS — prevents XSS token theft
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return res;
}