"use client";

import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const submit = async () => {
    const res = await fetch("/api/login", { method: "POST" });
    if (!res.ok) return;

    // ensures navigation happens after fetch completes
    router.replace("/dashboard");

    // optional: forces client to re-fetch server components with new cookies
    router.refresh();
  };

  return <button onClick={submit}>Login</button>;
}