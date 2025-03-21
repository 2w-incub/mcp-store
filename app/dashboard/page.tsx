'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getServers, type Server } from '@/lib/api'

function ServerCard({ server }: { server: Server }) {
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
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Rating</span>
            <span className="font-medium">{server.rating}/5.0</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {server.compatibility.map((client: string) => (
              <Badge key={client} variant="secondary" className="text-xs">
                {client}
              </Badge>
            ))}
          </div>
          <Link href={`/dashboard/server/${server.id}`} passHref>
            <Button className="mt-2 w-full bg-purple-600 text-white hover:bg-purple-700">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [featuredServers, setFeaturedServers] = useState<Server[]>([])
  const [latestServers, setLatestServers] = useState<Server[]>([])
  const [recommendedServers, setRecommendedServers] = useState<Server[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchServerData = async () => {
      try {
        setLoading(true)

        // Fetch all servers
        const serversData = await getServers()

        // Split servers into categories (in a real app, this would be done by the API)
        const featured = serversData.slice(0, 3)
        const latest = serversData.slice(3, 6)
        const recommended = serversData.slice(6, 9)

        setFeaturedServers(featured)
        setLatestServers(latest)
        setRecommendedServers(recommended)
        setError(null)
      } catch (err) {
        console.error('Error fetching servers:', err)
        setError('Failed to load servers. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchServerData()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to MCP Store</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Discover and install MCP servers to enhance your AI capabilities.
        </p>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <Tabs defaultValue="featured" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-3">
          <TabsTrigger value="featured">Featured Servers</TabsTrigger>
          <TabsTrigger value="latest">Latest Additions</TabsTrigger>
          <TabsTrigger value="recommended">Recommended For You</TabsTrigger>
        </TabsList>

        <TabsContent value="featured" className="mt-0">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {featuredServers.length > 0 ? (
                featuredServers.map((server) => <ServerCard key={server.id} server={server} />)
              ) : (
                <p className="col-span-3 text-center text-slate-500">
                  No featured servers available.
                </p>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="latest" className="mt-0">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {latestServers.length > 0 ? (
                latestServers.map((server) => <ServerCard key={server.id} server={server} />)
              ) : (
                <p className="col-span-3 text-center text-slate-500">
                  No latest servers available.
                </p>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommended" className="mt-0">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recommendedServers.length > 0 ? (
                recommendedServers.map((server) => <ServerCard key={server.id} server={server} />)
              ) : (
                <p className="col-span-3 text-center text-slate-500">
                  No recommended servers available.
                </p>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
