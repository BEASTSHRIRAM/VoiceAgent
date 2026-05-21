import { AccessToken } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 500 });
    }

    // Create a test token
    const token = new AccessToken(apiKey, apiSecret, {
      identity: "test-user",
      ttl: 3600,
    });

    token.addGrant({
      room: "test-room",
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    // IMPORTANT: toJwt() returns a Promise, must await it!
    const jwt = await token.toJwt();
    const jwtString = String(jwt);

    // Try to decode it to verify it's valid
    const parts = jwtString.split(".");
    if (parts.length !== 3) {
      return NextResponse.json(
        { 
          error: "Invalid JWT format",
          jwtType: typeof jwt,
          jwtValue: String(jwt).substring(0, 50)
        },
        { status: 500 }
      );
    }

    // Decode the payload (middle part)
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64").toString("utf-8")
    );

    return NextResponse.json({
      token: jwtString,
      payload,
      apiKeyUsed: apiKey.substring(0, 10),
      isValid: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Token generation failed",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
