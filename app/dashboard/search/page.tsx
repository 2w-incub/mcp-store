'use client'

import { useSearchParams } from 'next/navigation'
import ServerBrowser from '@/components/ServerBrowser'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category') || undefined
  const initialClient = searchParams.get('client') || undefined

  return (
    <div className="container mx-auto pb-8">
      <ServerBrowser
        initialCategory={initialCategory}
        initialClient={initialClient}
        showFilters={true}
        title="Search MCP Servers"
        description="Browse and discover MCP servers to enhance your AI capabilities"
      />
    </div>
  )
}
