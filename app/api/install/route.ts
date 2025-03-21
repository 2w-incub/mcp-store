import { NextRequest, NextResponse } from "next/server";
import { createInstallationLog } from "../../../utils/supabase";
import { getAuth } from "@clerk/nextjs/server";

// Mock installation tracking
const installations: Record<string, {
  serverId: string,
  status: "pending" | "installing" | "completed" | "failed",
  progress: number,
  client: string,
  startedAt: string,
  completedAt?: string,
  error?: string
}> = {};

// Generates a unique installation ID
function generateInstallationId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serverId, client } = body;

    // Get user ID from Clerk if authenticated
    const { userId } = getAuth(request);

    if (!serverId) {
      return NextResponse.json(
        { error: "Missing server ID" },
        { status: 400 }
      );
    }

    if (!client) {
      return NextResponse.json(
        { error: "Missing client name" },
        { status: 400 }
      );
    }

    // Create a new installation record
    const installationId = generateInstallationId();
    const installation = {
      serverId,
      client,
      status: "pending" as const,
      progress: 0,
      startedAt: new Date().toISOString()
    };

    installations[installationId] = installation;

    // Log the installation attempt in Supabase
    await createInstallationLog({
      user_id: userId || null,
      server_id: serverId,
      status: "pending"
    });

    // Simulate installation process (this would be a real installation in production)
    setTimeout(async () => {
      try {
        // Update status to installing
        installations[installationId].status = "installing";
        installations[installationId].progress = 50;

        // Log installing status
        await createInstallationLog({
          user_id: userId || null,
          server_id: serverId,
          status: "installing"
        });

        // Simulate installation completion
        setTimeout(async () => {
          // In a real app, this is where we'd do actual installation work
          const success = Math.random() > 0.2; // 80% success rate for demo

          if (success) {
            installations[installationId].status = "completed";
            installations[installationId].progress = 100;
            installations[installationId].completedAt = new Date().toISOString();

            // Log successful installation
            await createInstallationLog({
              user_id: userId || null,
              server_id: serverId,
              status: "success"
            });
          } else {
            installations[installationId].status = "failed";
            installations[installationId].error = "Installation failed - simulated error";

            // Log failed installation
            await createInstallationLog({
              user_id: userId || null,
              server_id: serverId,
              status: "failed",
              error_message: "Installation failed - simulated error"
            });
          }
        }, 3000);
      } catch (error) {
        console.error("Installation process error:", error);
        installations[installationId].status = "failed";
        installations[installationId].error = "Internal server error";

        // Log error
        await createInstallationLog({
          user_id: userId || null,
          server_id: serverId,
          status: "failed",
          error_message: "Internal server error"
        });
      }
    }, 1000);

    return NextResponse.json({
      installationId,
      status: installation.status,
      progress: installation.progress
    });
  } catch (error) {
    console.error("Installation request error:", error);
    return NextResponse.json(
      { error: "Failed to process installation request" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const installationId = url.searchParams.get("id");

  if (!installationId) {
    // Return all installations if no ID is provided
    return NextResponse.json(Object.entries(installations).map(([id, data]) => ({
      id,
      ...data
    })));
  }

  const installation = installations[installationId];
  if (!installation) {
    return NextResponse.json(
      { error: "Installation not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: installationId,
    ...installation
  });
}