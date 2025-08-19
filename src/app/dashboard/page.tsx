import React from 'react'
import Link from 'next/link'

export default function Dashboard() {
  return (
    <div className="min-h-screen p-8">
      <nav className="flex gap-4 items-center mb-8">
        <Link 
          href="/"
          className="rounded-lg border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm h-10 px-4"
        >
          Home
        </Link>
        <Link 
          href="/about"
          className="rounded-lg border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm h-10 px-4"
        >
          About
        </Link>
      </nav>
      <h1 className="text-2xl font-bold">Dashboard Page</h1>
      <p className="mt-4">Welcome to your admin dashboard!</p>
    </div>
  )
}
