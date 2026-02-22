import { NextResponse } from "next/server";

export async function POST() {
    const res = NextResponse.json({ ok: true });

    res.cookies.set("access_token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzcyOTM3Mzc5LCJpYXQiOjE3NzE3Mjc3NzksImp0aSI6IjYyNzI2NjdlZTc2NzQwNmM5NmQyODc5MzM1ZDllZmIzIiwidXNlcl9pZCI6IjI3In0.DjIBSw-_k6hwIHuvPGodccQ0U4EJBp9hdgyAYKzed-o", {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        // secure: process.env.NODE_ENV === "production",
    });

    return res;
}