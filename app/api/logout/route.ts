import { NextRequest, NextResponse } from "next/server";
import { invalidateProfile } from "@/src/lib/profileCache";

export async function POST(req: NextRequest) {
    const TOKEN_NAME = process.env.NEXT_PUBLIC_TOKEN_NAME || "access_token";
    const token = req.cookies.get(TOKEN_NAME)?.value;
    if (token) {
        const cacheKey = `profile:${token.slice(0, 16)}`;
        invalidateProfile(cacheKey);
    }

    const res = NextResponse.json({ success: true }, { status: 200 });
    res.cookies.set(TOKEN_NAME, "", { path: "/", maxAge: 0 });
    res.cookies.set("user", "", { path: "/", maxAge: 0 });
    res.cookies.set("refresh_token", "", { path: "/", maxAge: 0 });

    return res;
}