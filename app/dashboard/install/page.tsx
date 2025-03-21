"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const INSTALLATION_STEPS = [
  "Downloading server files",
  "Validating package integrity",
  "Configuring server settings",
  "Integrating with MCP client",
  "Finalizing installation"
];

// List of compatible MCP clients
const MCP_CLIENTS = [
  { id: "claude-desktop", name: "Claude Desktop", path: "/Applications/Claude.app" },
  { id: "cursor", name: "Cursor", path: "/Applications/Cursor.app" }
];

// Recently installed servers (would come from API in real app)
const RECENT_INSTALLATIONS = [
  {
    id: 1,
    name: "Claude MCP Server",
    status: "success",
    installedAt: "2024-03-15T10:30:00Z",
    client: "Claude Desktop"
  },
  {
    id: 2,
    name: "Code Interpreter",
    status: "success",
    installedAt: "2024-03-10T14:45:00Z",
    client: "Cursor"
  }
];

export default function InstallPage() {
  const [selectedClient, setSelectedClient] = useState("");
  const [isInstalling, setIsInstalling] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [recentInstalls, setRecentInstalls] = useState(RECENT_INSTALLATIONS);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Simulate an installation process
  const handleInstall = () => {
    if (!selectedClient) {
      toast.error("Please select an MCP client first");
      return;
    }

    setIsInstalling(true);
    setError(null);
    setCurrentStep(0);
    setProgress(0);

    // Simulate the installation steps with progress
    const interval = setInterval(() => {
      setCurrentStep(step => {
        const newStep = step + 1;
        if (newStep >= INSTALLATION_STEPS.length) {
          clearInterval(interval);

          // Simulate occasional random errors
          const shouldFail = Math.random() < 0.3;

          if (shouldFail && retryCount < 2) {
            setError("Connection timeout while integrating with MCP client. Please check your network connection and try again.");
            setIsInstalling(false);
            setRetryCount(count => count + 1);
            return step;
          } else {
            // Success case
            setTimeout(() => {
              setIsInstalling(false);
              toast.success("Server installed successfully!");

              // Add to recent installations
              const newInstall = {
                id: Math.floor(Math.random() * 1000),
                name: "New Sample Server",
                status: "success",
                installedAt: new Date().toISOString(),
                client: MCP_CLIENTS.find(c => c.id === selectedClient)?.name || selectedClient
              };

              setRecentInstalls([newInstall, ...recentInstalls]);
              setRetryCount(0);
            }, 500);
          }
        }

        return newStep;
      });

      setProgress(prog => {
        const increment = 100 / INSTALLATION_STEPS.length;
        return Math.min(prog + increment, 99);
      });
    }, 1000);

    return () => clearInterval(interval);
  };

  // Auto-retry on error
  useEffect(() => {
    if (error && retryCount > 0) {
      const timer = setTimeout(() => {
        toast.info(`Retrying installation (Attempt ${retryCount}/2)...`);
        handleInstall();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [error, retryCount]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Install MCP Server</h1>
        <p className="text-slate-500 dark:text-slate-400">
          One-click installation for MCP servers into your client applications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Installation Manager</CardTitle>
              <CardDescription>
                Configure and initiate the installation of MCP servers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Select MCP Client</h3>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a client application" />
                    </SelectTrigger>
                    <SelectContent>
                      {MCP_CLIENTS.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select the MCP client where you want to install the server
                  </p>
                </div>

                {selectedClient && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Selected Client Path</h3>
                    <p className="text-sm p-2 bg-slate-100 dark:bg-slate-800 rounded">
                      {MCP_CLIENTS.find(c => c.id === selectedClient)?.path || "Unknown path"}
                    </p>
                  </div>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>Installation Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {isInstalling ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Installing...</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Current Step:</h3>
                      <p className="text-sm font-medium">{INSTALLATION_STEPS[currentStep]}</p>

                      <div className="space-y-1 mt-2">
                        {INSTALLATION_STEPS.map((step, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${index <= currentStep ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                            <p className={`text-xs ${index <= currentStep ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={handleInstall}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={!selectedClient}
                  >
                    Install Server
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recently Installed</CardTitle>
              <CardDescription>
                History of your recent MCP server installations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentInstalls.length > 0 ? (
                <div className="space-y-4">
                  {recentInstalls.map((install, index) => (
                    <div key={install.id}>
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <h3 className="font-medium">{install.name}</h3>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(install.installedAt).toLocaleDateString()} {new Date(install.installedAt).toLocaleTimeString()}
                            </p>
                            <Badge variant={install.status === "success" ? "default" : "destructive"} className="text-xs">
                              {install.status === "success" ? "Completed" : "Failed"}
                            </Badge>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {install.client}
                        </Badge>
                      </div>
                      {index < recentInstalls.length - 1 && <Separator className="my-4" />}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 dark:text-slate-400">
                  No recent installations found
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Installation Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">1. Select your MCP client</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Choose the client application where you want to install the MCP server.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">2. Verify client path</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Ensure the detected path to your client application is correct.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">3. Click Install</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Press the Install button to begin the one-click installation process.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">4. Wait for completion</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  The installer will handle everything - downloading, configuring, and integrating with your client.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Troubleshooting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Installation Fails</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  The installation will automatically retry up to 2 times in case of failure. If it still fails, check your network connection.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Client Not Detected</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Make sure your MCP client is properly installed and you have the latest version.
                </p>
              </div>
              <Button variant="outline" className="w-full mt-2" onClick={() => toast.info("Support Contact: support@mcpstore.example.com")}>
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}