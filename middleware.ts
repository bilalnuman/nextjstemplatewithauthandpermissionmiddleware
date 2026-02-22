// import type { NextRequest } from "next/server";
// import { NextResponse } from "next/server";
// import { publicRoutes } from "./src/constant/routes";
// import type { ProfileResponse } from "./src/types/userProfileTypes";
// import { checkAccess } from "./src/lib/checkAccess";

// const trimSlashes = (s: string) => s.replace(/^\/+|\/+$/g, "");

// export async function middleware(request: NextRequest) {
//   const currentUrl = trimSlashes(request.nextUrl.pathname).toLowerCase().trim();

//   const TOKEN_NAME = process.env.NEXT_PUBLIC_TOKEN_NAME || "access_token";
//   const token = request.cookies.get(TOKEN_NAME)?.value || "";

//   if (publicRoutes.includes(currentUrl) && token) {
//     return NextResponse.redirect(new URL("/dashboard", request.url));
//   }

//   if (!token) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }


//   const profileUrl = new URL("/api/profile", request.url);
//   const res = await fetch(profileUrl, {
//     headers: { cookie: request.headers.get("cookie") ?? "" },
//     cache: "no-store",
//   });

//   let data: ProfileResponse;
//   try {
//     data = (await res.json()) as ProfileResponse;
//   } catch {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   if (!data.success && (data.statusCode === 401 || data.statusCode === 403)) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   if (data.success && data.is_subscribed === false) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   if (!checkAccess({ ...data, currentUrl }) && currentUrl !== "access-not-allowed") {

//     return NextResponse.redirect(new URL("/access-not-allowed", request.url));
//   }
//   // if (checkAccess({ ...data, currentUrl }) && currentUrl == "access-not-allowed") {
//   //   return NextResponse.redirect(new URL("/dashboard", request.url));
//   // }


//   const response = NextResponse.next();
//   const setCookie = res.headers.get("set-cookie");
//   if (setCookie) response.headers.append("set-cookie", setCookie);
//   return response;
// }

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { publicRoutes } from "./src/constant/routes";
import { checkAccess } from "./src/lib/checkAccess";
import type { ProfileResponse } from "./src/types/userProfileTypes";

const trimSlashes = (s: string) => s.replace(/^\/+|\/+$/g, "");

export async function middleware(request: NextRequest) {
  const currentUrl = trimSlashes(request.nextUrl.pathname).toLowerCase().trim();

  const TOKEN_NAME = process.env.NEXT_PUBLIC_TOKEN_NAME || "access_token";
  const token = request.cookies.get(TOKEN_NAME)?.value || "";

  const isPublic = publicRoutes.includes(currentUrl);

  // ✅ If it's a public route, allow it when logged out
  if (isPublic && !token) {
    return NextResponse.next();
  }

  // ✅ If it's public but user is logged in, send them to dashboard
  if (isPublic && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ✅ Protected route requires token
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Only now fetch profile (protected only)
  const profileUrl = new URL("/api/profile", request.url);
  const res = await fetch(profileUrl, {
    headers: { cookie: request.headers.get("cookie") ?? "" },
    cache: "no-store",
  });

  let data: ProfileResponse;
  try {
    data = (await res.json()) as ProfileResponse;
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (!data.success && (data.statusCode === 401 || data.statusCode === 403)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (data.success && data.is_subscribed === false) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (!checkAccess({ ...data, currentUrl }) && currentUrl !== "access-not-allowed") {
    return NextResponse.redirect(new URL("/access-not-allowed", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/login",
    "/register",
    "/access-not-allowed",
    "/payments/:path*",
    {
      source:
        "/((?!api|_next/static|_next/image|favicon.ico|.*.png|.*.svg|.*.jpg|invoice-pdf).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};