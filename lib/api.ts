/**
 * API client utilities for interacting with MCP Store backend
 */

// Server types
export interface Server {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  compatibility: string[];
  version?: string;
  publisher?: string;
}

export interface ServerDetails extends Server {
  longDescription: string;
  versionHistory: {
    version: string;
    date: string;
    notes: string;
  }[];
  ratingCount: number;
  publisherUrl?: string;
  license: string;
  installCount: number;
  screenshots: string[];
  reviews: {
    user: string;
    rating: number;
    comment: string;
  }[];
}

// Installation types
export interface Installation {
  id: string;
  serverId: string;
  status: "pending" | "installing" | "validating" | "completed" | "failed";
  progress: number;
  currentStep?: number;
  totalSteps?: number;
  client: string;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

// Search parameters
export interface ServerSearchParams {
  query?: string;
  category?: string;
  client?: string;
  minRating?: number;
}

/**
 * Fetch servers with optional filtering
 */
export async function getServers(params: ServerSearchParams = {}): Promise<Server[]> {
  const searchParams = new URLSearchParams();

  if (params.query) {
    searchParams.append("query", params.query);
  }

  if (params.category) {
    searchParams.append("category", params.category);
  }

  if (params.client) {
    searchParams.append("client", params.client);
  }

  if (params.minRating !== undefined) {
    searchParams.append("minRating", params.minRating.toString());
  }

  const queryString = searchParams.toString();
  const url = `/api/servers${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch servers");
  }

  return response.json();
}

/**
 * Fetch details for a specific server
 */
export async function getServerDetails(id: string): Promise<ServerDetails> {
  const response = await fetch(`/api/servers/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch server details");
  }

  return response.json();
}

/**
 * Start installation of a server
 */
export async function installServer(serverId: string, client: string): Promise<{installationId: string}> {
  const response = await fetch("/api/installation-status", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      serverId,
      client
    })
  });

  if (!response.ok) {
    throw new Error("Failed to start installation");
  }

  return response.json();
}

/**
 * Get installation status
 */
export async function getInstallationStatus(installationId: string): Promise<Installation> {
  const response = await fetch(`/api/installation-status?id=${installationId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch installation status");
  }

  return response.json();
}

/**
 * Retry a failed installation
 */
export async function retryInstallation(installationId: string): Promise<{id: string, status: string}> {
  const response = await fetch("/api/installation-status", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      installationId,
      action: "retry"
    })
  });

  if (!response.ok) {
    throw new Error("Failed to retry installation");
  }

  return response.json();
}

/**
 * Cancel an ongoing installation
 */
export async function cancelInstallation(installationId: string): Promise<{id: string, status: string}> {
  const response = await fetch("/api/installation-status", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      installationId,
      action: "cancel"
    })
  });

  if (!response.ok) {
    throw new Error("Failed to cancel installation");
  }

  return response.json();
}