import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import BettingABI from "@/abi/Betting.json";

// Contract address from the BettingService
const contractAddress = "0x930aE314a7285B7Cac2E5c7b1c59319837816D48";

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const {
      twitterHandle,
      title,
      description,
      category,
      endDate,
      amount,
      initialPoolAmount,
      imageURL,
    } = body;

    // Validate required fields
    if (
      !twitterHandle ||
      !title ||
      !description ||
      !category ||
      !endDate ||
      !amount ||
      !initialPoolAmount
    ) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Connect to the provider - use environment variable for RPC URL
    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_URL || "https://testnet.aurora.dev"
    );

    // Use your agent private key from environment variables
    const privateKey = process.env.AGENT_PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json(
        { error: "Agent private key not configured" },
        { status: 500 }
      );
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    const bettingContract = new ethers.Contract(
      contractAddress,
      BettingABI,
      wallet
    );

    // Check if the Twitter handle is linked to an address
    const userAddress = await bettingContract.twitterToAddress(twitterHandle);
    if (userAddress === ethers.ZeroAddress) {
      return NextResponse.json(
        {
          error: "Twitter handle not linked",
          message:
            "The Twitter handle is not linked to any wallet address. Please register the Twitter handle first.",
        },
        { status: 400 }
      );
    }

    // Call the createBetForUser function
    const tx = await bettingContract.createBetForUser(
      twitterHandle,
      title,
      description,
      category,
      endDate,
      amount,
      initialPoolAmount,
      imageURL || "/placeholder.svg" // Default image if not provided
    );

    const receipt = await tx.wait();

    // Construct the redirect URL with the bet ID
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const betId = receipt.logs[0]?.topics[1]; // Assuming the first log contains the bet ID
    const redirectUrl = `${baseURL}/bets/place-bet?id=${betId}`;

    // Return success response with transaction details
    return NextResponse.json({
      success: true,
      message: "Bet created successfully",
      transactionHash: receipt.hash,
      betId: betId,
      redirectUrl: redirectUrl,
    });
  } catch (error: any) {
    console.error("Error creating bet:", error);

    // Check for onlyAgent error
    if (
      error.message &&
      error.message.includes("Only agent can call this function")
    ) {
      return NextResponse.json(
        {
          error: "Agent authorization failed",
          message:
            "The wallet address is not authorized as an agent in the smart contract. Please check setup-guide.md for instructions.",
          walletAddress: new ethers.Wallet(process.env.AGENT_PRIVATE_KEY || "")
            .address,
        },
        { status: 403 }
      );
    }

    // Check for Twitter handle not registered error
    if (
      error.message &&
      error.message.includes("Twitter handle not registered")
    ) {
      return NextResponse.json(
        {
          error: "Twitter handle not registered",
          message: `The Twitter handle provided is not registered in the smart contract. Users must register their Twitter handle with their wallet address first.`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create bet",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
