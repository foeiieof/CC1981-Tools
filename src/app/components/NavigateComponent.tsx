'use client'

import Link from 'next/link'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu"
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useIsMobile } from '@/components/ui/hooks/use-mobile'

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}

export default function NavComponent() {
  // const pathName = usePathname()

  const links = [
    { name: 'Home', href: '/' },
    // { name: 'Employee', href: '/employee' },
    { name: 'B2C', href: '/b2c' },
    { name: 'Campaign', href: '/campaign' },
    { name: 'Shopee', href: '/shopee' },
    { name: 'TikTok', href: '/tiktok' },
    { name: 'Tools', href: '/tools' },
    // { name: 'Sign in', href: '/register' },
    // { name: 'Sign up', href: '/login' }
  ]
  const components: { title: string; href: string; description: string }[] = [
    {
      title: "Alert Dialog",
      href: "/docs/primitives/alert-dialog",
      description:
        "A modal dialog that interrupts the user with important content and expects a response.",
    },
    {
      title: "Hover Card",
      href: "/docs/primitives/hover-card",
      description:
        "For sighted users to preview content available behind a link.",
    },
    {
      title: "Progress",
      href: "/docs/primitives/progress",
      description:
        "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
    },
    {
      title: "Scroll-area",
      href: "/docs/primitives/scroll-area",
      description: "Visually or semantically separates content.",
    },
    {
      title: "Tabs",
      href: "/docs/primitives/tabs",
      description:
        "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
    },
    {
      title: "Tooltip",
      href: "/docs/primitives/tooltip",
      description:
        "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
    },
  ]

  const pathName = usePathname()
  const isMobile = useIsMobile()

  return (
    <NavigationMenu className='mx-auto p-4' viewport={isMobile}>
      <NavigationMenuList className='flex-wrap'>

        {links.map((i) => {
          return (
            <NavigationMenuItem key={`key-${i.name}`} className='[&_[data-active]]:font-bold [&_[data-active]]:bg-accent'>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()} active={pathName === i.href}>
                <Link href={i.href} className=''>
                  <span className=""> {i.name} </span>
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          )
        })}

      </NavigationMenuList>
    </NavigationMenu>
  )
}
