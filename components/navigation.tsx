import Link from "next/link"

import { siteConfig } from "@/config/site"
import { Icons } from "@/components/icons"
import { MainNav } from "@/components/main-nav"

export function SiteHeader() {
  return (
    <header className="bg-background sticky top-0 z-40 w-full border-b">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex flex-1 items-center justify-between space-x-0 sm:space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <Icons.logo className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">{siteConfig.name}</span>
          </Link>

          <MainNav className="mx-6 hidden space-x-4 lg:flex" />
        </div>
        <div className="flex items-center space-x-2">
          <nav className="flex items-center space-x-1"></nav>
        </div>
      </div>
    </header>
  )
}
