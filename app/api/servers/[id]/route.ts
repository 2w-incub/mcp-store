import { NextRequest, NextResponse } from "next/server";
import { getServerById, getServerReviews } from "../../../../utils/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    // Get the server details
    const server = await getServerById(id);

    if (!server) {
      return NextResponse.json(
        { error: "Server not found" },
        { status: 404 }
      );
    }

    // Get the server reviews
    const reviews = await getServerReviews(id);

    // Calculate average rating if reviews exist
    let averageRating = null;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      averageRating = totalRating / reviews.length;
    }

    // Combine server data with reviews and rating
    const serverData = {
      ...server,
      reviews,
      averageRating,
      reviewCount: reviews.length
    };

    return NextResponse.json(serverData);
  } catch (error) {
    console.error("Error fetching server details:", error);
    return NextResponse.json(
      { error: "Failed to fetch server details" },
      { status: 500 }
    );
  }
}