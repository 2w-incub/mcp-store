import { NextRequest, NextResponse } from "next/server";
import { getServers } from "../../../utils/supabase";

export async function GET(request: NextRequest) {
  try {
    // Get servers from Supabase
    const servers = await getServers();

    // Get search params
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.toLowerCase() || "";
    const compatibility = searchParams.get("compatibility") || "";
    // Note: Rating filtering would require a separate review retrieval and calculation

    // Filter servers based on search parameters
    let filteredServers = servers;

    // Apply filters
    if (query) {
      filteredServers = filteredServers.filter(
        (server) =>
          server.name.toLowerCase().includes(query) ||
          (server.description && server.description.toLowerCase().includes(query))
      );
    }

    if (compatibility) {
      filteredServers = filteredServers.filter((server) => {
        // Check if compatibility field exists and includes the requested client
        if (!server.compatibility) return false;

        // Handle different ways compatibility might be stored
        const compatibilityData = typeof server.compatibility === 'string'
          ? JSON.parse(server.compatibility)
          : server.compatibility;

        return Array.isArray(compatibilityData.clients)
          ? compatibilityData.clients.includes(compatibility)
          : false;
      });
    }

    // Return filtered servers
    return NextResponse.json(filteredServers);
  } catch (error) {
    console.error("Error fetching servers:", error);
    return NextResponse.json(
      { error: "Failed to fetch servers" },
      { status: 500 }
    );
  }
}