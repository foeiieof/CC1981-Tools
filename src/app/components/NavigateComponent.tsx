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

interface INavs {
  name: string;
  href: string;
  desc?: string;
  subgroups?: INavs[]
}

export default function NavComponent() {
  // const pathName = usePathname()

  const links: INavs[] = [
    { name: 'Home', href: '/' },
    {
      name: 'B2C',
      href: '/b2c',
      subgroups: [
        {
          name: 'Campaign',
          href: '/campaign',
          desc: 'Setup and Show all campaign'
        },
        {
          name: 'Order management',
          href: '/b2c',
          desc: 'Actions Order '
        },
        {
          name: 'Platform console',
          href: '/platform',
          desc: 'Orgazines your all platform and process works'
        },

      ]
    },
    // { name: 'Campaign', href: '/campaign' },
    { name: 'Shopee', href: '/shopee' },
    { name: 'TikTok', href: '/tiktok' },
    { name: 'Tools', href: '/tools' },
  ]


  const pathName = usePathname()
  const isMobile = useIsMobile()

  return (
    <NavigationMenu className='mx-auto p-4 z-50' viewport={isMobile}>
      <NavigationMenuList className='flex-wrap'>

        {
          links.map((i) => {
            if (i.subgroups) {
              return (
                <NavigationMenuItem className="hidden md:block" key={`navsub-${i.name}`}>
                  <NavigationMenuTrigger>{i.name}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[300px] gap-4">
                      <li>
                        {
                          i.subgroups.map((n, i) => {
                            return (
                              <NavigationMenuLink key={`sub-${i}-${n.name}`} asChild>
                                <Link href={n.href}>
                                  <div className="font-medium">{n.name}</div>
                                  {
                                    n.desc ? (
                                      <div className="text-muted-foreground"> {n.desc}</div>

                                    ) : (
                                      ""
                                    )
                                  }
                                </Link>
                              </NavigationMenuLink>

                            )
                          })
                        }
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>


              )
            }
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
