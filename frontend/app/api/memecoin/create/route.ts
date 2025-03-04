import { createToken } from "@/services/memecoin-launchpad";
import { NextResponse } from "next/server";

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const formData = await req.formData();

    const file = formData.get("image") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }
    const metadataString = formData.get("metadata") as string | null;
    if (!metadataString) {
      return NextResponse.json({ error: "No metadata provided" }, { status: 400 });
    }

    const result = await createToken(metadataString, file);
    const metaData = JSON.parse(metadataString); // Convert metadata string to JSON
    return NextResponse.json({metaData:metaData}, {status:200});


    // return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (error) {
    console.error("Create Token Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
