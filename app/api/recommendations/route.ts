import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getServers, logAnalytics } from "../../../utils/supabase";
import { getAuth } from "@clerk/nextjs/server";
import { Json } from "../../../types/supabase";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(req: NextRequest) {
  try {
    // Get user ID from auth if available
    const { userId } = getAuth(req);

    // Get user preferences from query parameters
    const url = new URL(req.url);
    const category = url.searchParams.get("category") || "";
    const compatibility = url.searchParams.get("compatibility") || "";
    const userHistory = url.searchParams.get("history") || "";

    // Get real servers from Supabase
    const allServers = await getServers();

    // Log this request in analytics
    await logAnalytics(
      userId || null,
      "request_recommendations",
      {
        category,
        compatibility,
        userHistory,
        timestamp: new Date().toISOString()
      }
    );

    // Generate a prompt for the AI based on user preferences
    const prompt = generatePrompt(
      category,
      compatibility,
      userHistory,
      allServers.map(server => ({
        id: server.id,
        name: server.name,
        description: server.description || "",
        compatibility: server.compatibility,
      }))
    );

    // Call OpenAI API to get personalized recommendations
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an AI that generates personalized MCP server recommendations for users. " +
            "Your recommendations should be based on the user's preferences, browsing history, and the available servers. " +
            "Provide recommendations in JSON format with the following fields for each server: " +
            "id, name, description, reason (why you're recommending this server). " +
            "Return exactly 3 recommendations from the provided server list."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    // Parse the OpenAI response
    const responseContent = completion.choices[0].message.content;

    if (!responseContent) {
      return NextResponse.json(
        { error: "Failed to generate recommendations" },
        { status: 500 }
      );
    }

    // Parse the JSON response from OpenAI
    const recommendationsData = JSON.parse(responseContent);

    // Log successful recommendations in analytics
    await logAnalytics(
      userId || null,
      "successful_recommendations",
      {
        recommendations: recommendationsData,
        timestamp: new Date().toISOString()
      }
    );

    // Return the personalized recommendations
    return NextResponse.json(recommendationsData);
  } catch (error) {
    console.error("Error generating recommendations:", error);

    // Log the error in analytics
    try {
      const { userId } = getAuth(req);
      await logAnalytics(
        userId || null,
        "failed_recommendations",
        {
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString()
        }
      );
    } catch (analyticsError) {
      console.error("Failed to log analytics:", analyticsError);
    }

    // Get a few random servers as fallback recommendations
    try {
      const allServers = await getServers();
      const fallbackRecommendations = allServers
        .sort(() => 0.5 - Math.random()) // Shuffle array
        .slice(0, 3) // Take first 3 elements
        .map(server => ({
          id: server.id,
          name: server.name,
          description: server.description || "",
          reason: "Based on general popularity"
        }));

      return NextResponse.json(
        { recommendations: fallbackRecommendations },
        { status: 200 }
      );
    } catch (_) {
      // If even fallback fails, return empty recommendations
      return NextResponse.json(
        { recommendations: [] },
        { status: 200 }
      );
    }
  }
}

// Helper function to generate a prompt for the AI based on user preferences
function generatePrompt(
  category: string,
  compatibility: string,
  userHistory: string,
  availableServers: Array<{id: string, name: string, description: string, compatibility: Json | null}>
): string {
  let prompt = "Please recommend MCP servers based on the following criteria";

  if (category) {
    prompt += ` in the category of ${category}`;
  }

  if (compatibility) {
    prompt += ` that are compatible with ${compatibility}`;
  }

  if (userHistory) {
    prompt += `. The user has previously shown interest in: ${userHistory}`;
  }

  prompt += ". Here is the list of available servers:\n";

  prompt += JSON.stringify(availableServers, null, 2);

  prompt += "\nReturn the recommendations as a JSON object with a 'recommendations' array containing 3 server objects.";

  return prompt;
}