import { NextRequest, NextResponse } from "next/server";
import { getTokenDetails } from "@/services/memecoin-launchpad";

export async function GET(
  req: NextRequest,
  { params }: { params: { tokenAddress: string } }
) {
  try {
    const { tokenAddress } = params;

    if (!tokenAddress) {
      return NextResponse.json(
        { error: "Token address is required" },
        { status: 400 }
      );
    }

    const tokenDetails = await getTokenDetails(tokenAddress);

    if (!tokenDetails) {
      return NextResponse.json(
        { error: "Token not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: tokenDetails,
    });
  } catch (error: any) {
    console.error("Error fetching token details:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch token details",
        message: error.message,
      },
      { status: 500 }
    );
  }
} 