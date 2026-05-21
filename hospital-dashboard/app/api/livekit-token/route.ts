import { NextRequest, NextResponse } from "next/server";
import { AccessToken, AgentDispatchClient } from "livekit-server-sdk";

export async function GET(request: NextRequest) {
  try {
    const roomName = request.nextUrl.searchParams.get("roomName");
    const participantName = request.nextUrl.searchParams.get("participantName");

    if (!roomName) {
      return NextResponse.json(
        { error: "Missing roomName parameter" },
        { status: 400 }
      );
    }

    if (!participantName) {
      return NextResponse.json(
        { error: "Missing participantName parameter" },
        { status: 400 }
      );
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const liveKitUrl = process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !liveKitUrl) {
      return NextResponse.json(
        {
          error:
            "Server configuration error: Missing LiveKit credentials",
        },
        { status: 500 }
      );
    }

    // Create unique room name with timestamp to ensure new room creation
    const uniqueRoomName = `${roomName}-${Date.now()}`;

    // Generate participant token
    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      ttl: "10m",
    });

    at.addGrant({
      room: uniqueRoomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();

    // Explicitly dispatch agent to room using AgentDispatchClient
    try {
      const dispatchClient = new AgentDispatchClient(
        liveKitUrl,
        apiKey,
        apiSecret
      );

      console.log(
        `Dispatching agent "hospital-assistant" to room "${uniqueRoomName}"`
      );

      const dispatch = await dispatchClient.createDispatch(
        uniqueRoomName,
        "hospital-assistant"
      );

      console.log("Agent dispatch created:", dispatch);
    } catch (dispatchError) {
      console.error("Error dispatching agent:", dispatchError);
      // Don't fail the token generation if dispatch fails
      // The agent might still join via other means
    }

    return NextResponse.json({ token, roomName: uniqueRoomName });
  } catch (error) {
    console.error("Error generating token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
