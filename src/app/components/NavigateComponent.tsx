'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function NavComponent() {
  // const pathName = usePathname()

  const links = [
    { name: 'Home', href: '/' },
    // { name: 'Employee', href: '/employee' },
    { name: 'Campaign', href: '/campaign' },
    { name: 'Shopee', href: '/shopee' },
    { name: 'TikTok', href: '/tiktok' },
    { name: 'Tools', href: '/tools' },
    // { name: 'Sign in', href: '/register' },
    // { name: 'Sign up', href: '/login' }
  ]

  const pathName = usePathname()

  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <nav>
      <div className='w-full'>
        <ul className='flex gap-[20px] justify-center items-center p-4'>
          {links.map(link => {
            const lineActive = (mounted ? pathName === link.href.toLowerCase() : false)
            return (
              <li key={link.href} className="group p-2 relative">
                <Link href={link.href}
                  className="transition-shadow duration-300 group-hover:text-shadow-[1px_0_0_rgba(0,0,0,1)]">
                  {
                    link.name
                  }
                  <span
                    className={`absolute left-0 bottom-0 h-0.5 w-0 bg-black transition-all duration-300 group-hover:w-full ${lineActive ? "w-full" : ""}`}>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )

}
