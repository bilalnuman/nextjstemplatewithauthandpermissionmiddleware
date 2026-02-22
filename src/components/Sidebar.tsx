"use client"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'

const Sidebar = () => {
    const router = useRouter()
    const handleLogout = async () => {
        const res = await fetch("/api/logout", { method: "POST" });
        if (!res.ok) return;

        // ensures navigation happens after fetch completes
        router.replace("/dashboard");

        // optional: forces client to re-fetch server components with new cookies
        router.refresh();
    };

    return (
        <aside className='w-[140px] border-e h-screen flex flex-col gap-1 pt-3'>
            <Link href={"/dashboard"} className='p-2'>Dashboard</Link>
            <Link href={"/payments"} className='p-2'>Payments</Link>
            <Link href={"/login"} className='p-2'>Login</Link>
            <Link href={"/register"} className='p-2'>Register</Link>
            <Link onClick={(e: any) => {
                e.preventDefault();
                handleLogout()
            }} href={"/#"} className='p-2'>Logout</Link>
        </aside>
    )
}

export default Sidebar