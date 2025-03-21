'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  AlertCircle,
  Calendar,
  Clock,
  Download,
  ExternalLink,
  RefreshCw,
  Star,
  Tag,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  getServerDetails,
  installServer,
  getInstallationStatus,
  retryInstallation,
} from '@/lib/api'
import type { ServerDetails, Installation } from '@/lib/api'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function ServerDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [server, setServer] = useState<ServerDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [installing, setInstalling] = useState(false)
  const [installationId, setInstallationId] = useState<string | null>(null)
  const [installationStatus, setInstallationStatus] = useState<Installation | null>(null)
  const [selectedClient, setSelectedClient] = useState<string>('')
  const [retrying, setRetrying] = useState(false)
  const [installationError, setInstallationError] = useState<string | null>(null)
  const [maxRetries] = useState(3)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const fetchServerDetails = async () => {
      if (!params.id) return

      try {
        setLoading(true)
        const data = await getServerDetails(params.id as string)
        setServer(data)

        // Set default selected client if server has compatibility options
        if (data.compatibility && data.compatibility.length > 0) {
          setSelectedClient(data.compatibility[0])
        }

        setError(null)
      } catch (err) {
        console.error('Error fetching server details:', err)
        setError('Failed to load server details. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchServerDetails()
  }, [params.id])

  // Poll installation status if we have an installation ID
  useEffect(() => {
    if (!installationId) return

    const checkStatus = async () => {
      try {
        const status = await getInstallationStatus(installationId)
        setInstallationStatus(status)

        // Check for completion or failure
        if (status.status === 'completed') {
          toast.success('Installation completed successfully!', {
            description: `${server?.name} has been installed.`,
          })

          // Reset installation state after successful installation
          setTimeout(() => {
            setInstallationId(null)
            setInstallationStatus(null)
            setInstalling(false)
          }, 3000)
        } else if (status.status === 'failed') {
          setInstallationError(status.error || 'Unknown error occurred')

          if (retryCount < maxRetries) {
            toast.error('Installation failed', {
              description: `Automatically retrying (${retryCount + 1}/${maxRetries})...`,
            })

            // Auto-retry
            setTimeout(() => handleRetry(), 2000)
          } else {
            toast.error('Installation failed', {
              description: 'Maximum retry attempts reached. Please try again manually.',
            })
            setInstalling(false)
          }
        } else {
          // Update progress UI based on installation status
          if (status.progress) {
            // You can use this to show a progress indicator
            console.log(`Installation progress: ${status.progress}%`)
          }
        }
      } catch (err) {
        console.error('Error checking installation status:', err)
      }
    }

    // Poll every 2 seconds while installation is in progress
    const intervalId = setInterval(checkStatus, 2000)

    return () => clearInterval(intervalId)
  }, [installationId, retryCount, maxRetries, server?.name])

  const handleInstall = async () => {
    if (!server) return
    if (!selectedClient) {
      toast.error('Please select a client', {
        description: 'You must select a compatible client before installing',
      })
      return
    }

    try {
      setInstalling(true)
      setInstallationError(null)
      setRetryCount(0)

      const { installationId: newInstallId } = await installServer(server.id, selectedClient)
      setInstallationId(newInstallId)

      toast.success('Installation started successfully!', {
        description: `Installing ${server.name} for ${selectedClient}...`,
        duration: 5000,
      })
    } catch (err) {
      console.error('Installation error:', err)
      toast.error('Failed to start installation', {
        description: 'Please try again later',
      })
      setInstalling(false)
    }
  }

  const handleRetry = async () => {
    if (!installationId) return

    try {
      setRetrying(true)
      setRetryCount((prev) => prev + 1)

      await retryInstallation(installationId)

      toast.success('Retrying installation...', {
        description: `Attempt ${retryCount + 1} of ${maxRetries}`,
      })

      setInstallationError(null)
    } catch (err) {
      console.error('Retry error:', err)
      toast.error('Failed to retry installation', {
        description: 'Please try again later',
      })
    } finally {
      setRetrying(false)
    }
  }

  const handleRedirectToInstall = () => {
    if (installationId) {
      router.push(`/dashboard/install?id=${installationId}`)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-1/3 rounded bg-gray-200"></div>
          <div className="h-4 w-2/3 rounded bg-gray-200"></div>
          <div className="h-64 rounded bg-gray-200"></div>
        </div>
      </div>
    )
  }

  if (error || !server) {
    return (
      <div className="container mx-auto py-8">
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error || 'Server not found'}
        </div>
        <div className="mt-4">
          <Link href="/dashboard/search">
            <Button variant="outline">Back to Search</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-8 py-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">{server.name}</h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{server.category}</Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{server.rating.toFixed(1)}</span>
                <span className="mx-1">•</span>
                <span>{server.ratingCount} reviews</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {server.compatibility && server.compatibility.length > 0 && (
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {server.compatibility.map((client) => (
                    <SelectItem key={client} value={client}>
                      {client}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button
              onClick={installationId ? handleRedirectToInstall : handleInstall}
              disabled={installing && !installationId}
              className="gap-2"
            >
              {installing && !installationId ? (
                <>
                  <span className="animate-spin">⟳</span> Installing...
                </>
              ) : installationId ? (
                <>
                  <Download className="h-4 w-4" /> View Installation
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" /> Install Server
                </>
              )}
            </Button>
          </div>
        </div>

        {installationError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Installation Error</AlertTitle>
            <AlertDescription>{installationError}</AlertDescription>
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={retrying || retryCount >= maxRetries}
                className="gap-1"
              >
                {retrying ? (
                  <>
                    <span className="animate-spin">⟳</span> Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3" /> Retry Installation
                  </>
                )}
              </Button>
              <span className="ml-2 text-xs">
                {retryCount}/{maxRetries} attempts
              </span>
            </div>
          </Alert>
        )}

        <p className="max-w-3xl text-muted-foreground">{server.description}</p>

        {/* Quick info */}
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Version {server.version}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{server.publisher}</span>
          </div>
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{server.installCount.toLocaleString()} installs</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{server.license} license</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Tabs for details, history, reviews */}
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="history">Version History</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        {/* Details tab */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line">{server.longDescription}</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Compatibility</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    {server.compatibility.map((client) => (
                      <Badge key={client} variant="outline" className="justify-start">
                        {client}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Publisher</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>{server.publisher}</div>
                  {server.publisherUrl && (
                    <Link
                      href={server.publisherUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                    >
                      Visit website <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Screenshots */}
          {server.screenshots && server.screenshots.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold">Screenshots</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {server.screenshots.map((screenshot, index) => (
                  <div key={index} className="overflow-hidden rounded-lg border">
                    {/* In a real app, we'd use Image component with proper sizing */}
                    <img
                      src={screenshot}
                      alt={`${server.name} screenshot ${index + 1}`}
                      className="h-auto w-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Version History tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Version History</CardTitle>
              <CardDescription>Release notes and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {server.versionHistory.map((version, index) => (
                  <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-semibold">Version {version.version}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-4 w-4" />
                        {version.date}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{version.notes}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews tab */}
        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>User Reviews</CardTitle>
              <CardDescription>
                {server.ratingCount} reviews with an average rating of {server.rating.toFixed(1)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {server.reviews.map((review, index) => (
                  <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-semibold">{review.user}</h3>
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Write a Review
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
