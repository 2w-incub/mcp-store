'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Package, Settings, LogIn, LogOut } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'

import {
  Sidebar,
  SidebarHeader,
  SidebarHeaderTitle,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'

export function Navigation() {
  const pathname = usePathname()
  const { isSignedIn, signOut } = useAuth()

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  return (
    <Sidebar defaultOpen={true}>
      <SidebarHeader>
        <SidebarHeaderTitle>MCP Store</SidebarHeaderTitle>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/dashboard" passHref legacyBehavior>
                  <SidebarMenuButton isActive={isActive('/dashboard')} tooltip="Home">
                    <Home className="mr-2" />
                    <span>Home</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/dashboard/search" passHref legacyBehavior>
                  <SidebarMenuButton isActive={isActive('/dashboard/search')} tooltip="Search">
                    <Search className="mr-2" />
                    <span>Search</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/dashboard/install" passHref legacyBehavior>
                  <SidebarMenuButton isActive={isActive('/dashboard/install')} tooltip="Install">
                    <Package className="mr-2" />
                    <span>Install</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isSignedIn ? (
                <>
                  <SidebarMenuItem>
                    <Link href="/dashboard/settings" passHref legacyBehavior>
                      <SidebarMenuButton
                        isActive={isActive('/dashboard/settings')}
                        tooltip="Settings"
                      >
                        <Settings className="mr-2" />
                        <span>Settings</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => signOut(() => (window.location.href = '/'))}
                      tooltip="Sign Out"
                    >
                      <LogOut className="mr-2" />
                      <span>Sign Out</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              ) : (
                <SidebarMenuItem>
                  <Link href="/auth/sign-in" passHref legacyBehavior>
                    <SidebarMenuButton tooltip="Sign In">
                      <LogIn className="mr-2" />
                      <span>Sign In</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
