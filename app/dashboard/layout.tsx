import { ReactNode } from 'react'
import { Navigation } from '@/components/navigation'
import { UserButton } from '@clerk/nextjs'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Navigation />
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-end border-b border-slate-800 bg-slate-950 px-6">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                userButtonAvatarBox: 'h-8 w-8',
              },
            }}
          />
        </header>
        <main className="flex-1 overflow-y-auto bg-slate-950 p-6">{children}</main>
      </div>
    </div>
  )
}
