// import { NextResponse, NextRequest } from "next/server";

// export async function GET(req: NextRequest) {
//     const TOKEN_NAME = process.env.NEXT_PUBLIC_TOKEN_NAME || "access_token";
//     try {
//         const token = req.cookies.get(TOKEN_NAME)?.value;

//         if (!token) {
//             return NextResponse.json(
//                 { success: false, statusCode: 401, message: "Unauthorized" }
//             );
//         }

//         const url = "https://testing.api.watchlytics.io/api/auth/me/";
//         const res = await fetch(url, {
//             method: "GET",
//             headers: {
//                 Authorization: `Bearer ${token}`,
//                 Accept: "application/json",
//             },
//             cache: "no-store",
//         });

//         // If backend denies, pass through status (401/403/etc)
//         if (!res.ok) {
//             const status = res.status;
//             return NextResponse.json(
//                 { success: false, status, message: "Backend auth failed" },
//             );
//         }

//         const data = await res.json();
//         const user = {
//             id: Number(data?.data?.id),
//             name: String(data?.data?.first_name ?? ""),
//             email: String(data?.data?.email ?? ""),
//             profile_picture: (data?.data?.profile_picture ?? null) as string | null,
//             is_subscribed: Boolean(data?.is_subscribed),
//             plan_name: (data?.current_subscription?.plan_name ?? null) as string | null,
//             is_trial: (data?.current_subscription?.is_trial ?? null) as boolean | null,
//             status: (data?.current_subscription?.status ?? null) as string | null,
//             is_active: (data?.current_subscription?.is_active ?? null) as boolean | null,
//             statusCode: 200,
//             permissions: ["read", "write"]
//         };

//         if (!user.is_subscribed) {
//             return NextResponse.json(
//                 { success: false, statusCode: 403, message: "NOT_SUBSCRIBED" },
//             );
//         }

//         return NextResponse.json({ success: true, ...user });
//     } catch {
//         return NextResponse.json(
//             { success: false, statusCode: 500, message: "Server error" },
//         );
//     }
// }



























import { NextResponse, NextRequest } from "next/server";
import { cachedProfile } from "@/src/lib/profileCache";

const TTL_MS = 1000 * 60;

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

        if (!user.is_subscribed) {
            return NextResponse.json(
                { success: false, statusCode: 403, message: "NOT_SUBSCRIBED" },
                { status: 403 }
            );
        }

        const response = NextResponse.json({ success: true, ...user }, { status: 200 });
        // response.cookies.set({
        //     name: "user",
        //     value: JSON.stringify({
        //         is_subscribed: user.is_subscribed,
        //         plan_name: user.plan_name,
        //         is_trial: user.is_trial,
        //         status: user.status
        //     }),
        //     httpOnly: true,
        //     path: "/",
        //     sameSite: "lax",
        //     secure: process.env.NEXT_PUBLIC_NODE_ENV === "production",
        // });
        return response;
    } catch {
        return NextResponse.json(
            { success: false, statusCode: 500, message: "Server error" },
            { status: 500 }
        );
    }
}