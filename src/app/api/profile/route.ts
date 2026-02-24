
import { NextResponse, NextRequest } from "next/server";
import { cachedProfile } from "@/src/lib/profileCache";

const TTL_MS = 1000 * 10;

type BackendMeResponse = any;

export async function GET(req: NextRequest) {
    const TOKEN_NAME = process.env.NEXT_PUBLIC_TOKEN_NAME || "access_token";
    const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    try {
        const token = req.cookies.get(TOKEN_NAME)?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, statusCode: 401, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const url = `${BASE_API_URL}/auth/me/`;
        const cacheKey = `profile:${token.slice(0, 16)}`;
        const { status, ok, json } = await cachedProfile(
            cacheKey,
            TTL_MS,
            async () => {
                console.log(url)
                const res = await fetch(url, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                    cache: "no-store",
                });

                const json = (await res.json().catch(() => null)) as BackendMeResponse;
                return {
                    ok: res.ok,
                    status: res.status,
                    json,
                };
            }
        );

        if (!ok) {
            return NextResponse.json(
                { success: false, statusCode: status, message: "Backend auth failed" },
                { status }
            );
        }

        const data = json;

        const user = {
            id: Number(data?.data?.id),
            name: String(data?.data?.first_name ?? ""),
            email: String(data?.data?.email ?? ""),
            profile_picture: (data?.data?.profile_picture ?? null) as string | null,
            is_subscribed: Boolean(data?.is_subscribed),
            plan_name: (data?.current_subscription?.plan_name ?? null) as string | null,
            is_trial: (data?.current_subscription?.is_trial ?? null) as boolean | null,
            status: (data?.current_subscription?.status ?? null) as string | null,
            is_active: (data?.current_subscription?.is_active ?? null) as boolean | null,
            statusCode: 200 as const,
            permissions: ["read", "write"] as const,
        };
        console.log(user)

        if (!user.is_subscribed) {
            return NextResponse.json(
                { success: false, statusCode: 403, message: "NOT_SUBSCRIBED" },
                { status: 403 }
            );
        }

        const response = NextResponse.json({ success: true, ...user }, { status: 200 });
        return response;
    } catch(error) {
        console.log(error)
        return NextResponse.json(
            { success: false, statusCode: 500, message: "Server error" },
            { status: 500 }
        );
    }
}