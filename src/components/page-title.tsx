import React from 'react'

export default function PageTitle({ children }: { children: React.ReactNode  }) {
  return (
    <h1 className='text-2xl font-bold border-b py-6 px-4 block w-[calc(100vw-var(--sidebar-width)-20px)]'>{children}</h1>
  )
}
