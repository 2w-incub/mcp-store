'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Star } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { getServers, type Server, type ServerSearchParams } from '@/lib/api'

type ServerBrowserProps = {
  initialCategory?: string
  initialClient?: string
  showFilters?: boolean
  title?: string
  description?: string
  limit?: number
}

export function ServerCard({ server }: { server: Server }) {
  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">{server.name}</CardTitle>
          <Badge variant="outline" className="text-xs">
            {server.category}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2 h-10">{server.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">Rating</span>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{server.rating}/5.0</span>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {server.compatibility.map((client: string) => (
            <Badge key={client} variant="secondary" className="text-xs">
              {client}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/dashboard/server/${server.id}`} className="w-full" passHref>
          <Button className="w-full bg-purple-600 text-white hover:bg-purple-700">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

// Available categories
const CATEGORIES = [
  'All Categories',
  'AI Assistant',
  'Development',
  'Utility',
  'Media',
  'Data Analysis',
]

// Available clients
const CLIENTS = ['Claude Desktop', 'Cursor', 'Other IDE']

export default function ServerBrowser({
  initialCategory,
  initialClient,
  showFilters = true,
  title = 'Browse MCP Servers',
  description = 'Discover and install MCP servers to enhance your AI capabilities',
  limit,
}: ServerBrowserProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(initialCategory)
  const [selectedClients, setSelectedClients] = useState<Set<string>>(
    initialClient ? new Set([initialClient]) : new Set()
  )
  const [minRating, setMinRating] = useState<number | undefined>(undefined)

  const [loading, setLoading] = useState(true)
  const [servers, setServers] = useState<Server[]>([])
  const [filteredServers, setFilteredServers] = useState<Server[]>([])
  const [error, setError] = useState<string | null>(null)

  // Handle client checkbox toggle
  const toggleClient = (client: string) => {
    const newSelectedClients = new Set(selectedClients)
    if (newSelectedClients.has(client)) {
      newSelectedClients.delete(client)
    } else {
      newSelectedClients.add(client)
    }
    setSelectedClients(newSelectedClients)
  }

  // Initial data fetch
  useEffect(() => {
    const fetchServers = async () => {
      try {
        setLoading(true)
        const data = await getServers()
        setServers(data)
        setFilteredServers(limit ? data.slice(0, limit) : data)
        setError(null)
      } catch (err) {
        setError('Failed to load servers. Please try again later.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchServers()
  }, [limit])

  // Filter servers when search criteria change
  useEffect(() => {
    const searchParams: ServerSearchParams = {}

    if (searchTerm) {
      searchParams.query = searchTerm
    }

    if (selectedCategory && selectedCategory !== 'All Categories') {
      searchParams.category = selectedCategory
    }

    if (selectedClients.size > 0) {
      // For simplicity in this demo, we're using the first selected client
      // Convert Set to Array for compatibility
      const clientsArray = Array.from(selectedClients)
      if (clientsArray.length > 0) {
        searchParams.client = clientsArray[0]
      }
    }

    if (minRating !== undefined) {
      searchParams.minRating = minRating
    }

    const fetchFilteredServers = async () => {
      try {
        setLoading(true)
        const data = await getServers(searchParams)
        setFilteredServers(limit ? data.slice(0, limit) : data)
        setError(null)
      } catch (err) {
        setError('Failed to filter servers. Please try again.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    // Only fetch if we have any filters applied
    if (Object.keys(searchParams).length > 0) {
      fetchFilteredServers()
    } else {
      setFilteredServers(limit ? servers.slice(0, limit) : servers)
    }
  }, [searchTerm, selectedCategory, selectedClients, minRating, servers, limit])

  return (
    <div className="space-y-6">
      {(title || description) && (
        <div className="flex flex-col space-y-2">
          {title && <h1 className="text-3xl font-bold tracking-tight">{title}</h1>}
          {description && <p className="text-slate-500 dark:text-slate-400">{description}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[250px_1fr]">
        {/* Filters */}
        {showFilters && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Filter Results</h3>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search servers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Category</h3>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                defaultValue="All Categories"
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Client Compatibility</h3>
              <div className="space-y-2">
                {CLIENTS.map((client) => (
                  <div key={client} className="flex items-center space-x-2">
                    <Checkbox
                      id={`client-${client}`}
                      checked={selectedClients.has(client)}
                      onCheckedChange={() => toggleClient(client)}
                    />
                    <Label htmlFor={`client-${client}`}>{client}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Minimum Rating</h3>
              <Select
                value={minRating?.toString()}
                onValueChange={(value) => setMinRating(value ? Number(value) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any Rating</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="4.5">4.5+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {loading ? 'Loading servers...' : `${filteredServers.length} servers found`}
            </h2>
            {showFilters && (
              <Select defaultValue="newest">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="rating">Highest Rating</SelectItem>
                  <SelectItem value="popularity">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {error && (
            <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: limit || 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="mb-2 h-6 w-3/4 rounded bg-slate-200 dark:bg-slate-700"></div>
                    <div className="h-10 w-full rounded bg-slate-200 dark:bg-slate-700"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 w-full rounded bg-slate-200 dark:bg-slate-700"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredServers.length > 0 ? (
                filteredServers.map((server) => <ServerCard key={server.id} server={server} />)
              ) : (
                <p className="col-span-3 text-center text-slate-500">
                  No servers found matching your criteria. Try adjusting your filters.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
