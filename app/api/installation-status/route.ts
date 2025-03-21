import { NextRequest, NextResponse } from "next/server";

// Mock installation data store
const installationJobs: Record<string, {
  serverId: string,
  status: "pending" | "installing" | "validating" | "completed" | "failed",
  progress: number,
  currentStep: number,
  totalSteps: number,
  client: string,
  startedAt: string,
  completedAt?: string,
  error?: string
}> = {};

// Simulate updating the installation status
function simulateInstallationProgress(installationId: string): void {
  const installation = installationJobs[installationId];
  if (!installation || installation.status === "completed" || installation.status === "failed") {
    return;
  }

  // Simulate progress updates
  const interval = setInterval(() => {
    const installation = installationJobs[installationId];
    if (!installation) {
      clearInterval(interval);
      return;
    }

    if (installation.progress >= 100) {
      installation.status = "completed";
      installation.progress = 100;
      installation.completedAt = new Date().toISOString();
      clearInterval(interval);
      return;
    }

    // Random chance of failure (10%)
    if (Math.random() < 0.1 && installation.progress > 10 && installation.progress < 90) {
      installation.status = "failed";
      installation.error = "Connection timeout during installation";
      clearInterval(interval);
      return;
    }

    // Update progress
    const progressIncrement = Math.floor(Math.random() * 5) + 1;
    installation.progress = Math.min(100, installation.progress + progressIncrement);

    // Update step if needed
    if (installation.progress > (installation.currentStep / installation.totalSteps) * 100) {
      installation.currentStep = Math.min(
        installation.totalSteps,
        Math.ceil((installation.progress / 100) * installation.totalSteps)
      );
    }

    // Update status based on progress
    if (installation.progress < 50) {
      installation.status = "installing";
    } else if (installation.progress < 90) {
      installation.status = "validating";
    }
  }, 1000);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { serverId, client } = body;

  if (!serverId || !client) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Create new installation job
  const installationId = Math.random().toString(36).substring(2, 15);
  installationJobs[installationId] = {
    serverId,
    client,
    status: "pending",
    progress: 0,
    currentStep: 0,
    totalSteps: 5,
    startedAt: new Date().toISOString()
  };

  // Start the installation simulation
  simulateInstallationProgress(installationId);

  return NextResponse.json({
    installationId,
    status: "pending",
    progress: 0,
    message: "Installation started"
  });
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const installationId = url.searchParams.get("id");

  if (!installationId) {
    return NextResponse.json(
      { error: "Installation ID is required" },
      { status: 400 }
    );
  }

  const installation = installationJobs[installationId];
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

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { installationId, action } = body;

  if (!installationId || !action) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const installation = installationJobs[installationId];
  if (!installation) {
    return NextResponse.json(
      { error: "Installation not found" },
      { status: 404 }
    );
  }

  if (action === "retry" && installation.status === "failed") {
    installation.status = "pending";
    installation.progress = Math.max(0, installation.progress - 20);
    installation.error = undefined;

    // Restart the installation process
    simulateInstallationProgress(installationId);

    return NextResponse.json({
      id: installationId,
      status: installation.status,
      message: "Installation retry initiated"
    });
  }

  if (action === "cancel") {
    installation.status = "failed";
    installation.error = "Installation cancelled by user";

    return NextResponse.json({
      id: installationId,
      status: installation.status,
      message: "Installation cancelled"
    });
  }

  return NextResponse.json(
    { error: "Invalid action" },
    { status: 400 }
  );
}