"use client";

import { useState, useCallback, useEffect } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useVoiceAssistant,
  BarVisualizer,
  useRoomInfo,
  useConnectionState,
  VoiceAssistantControlBar,
  useParticipants,
} from "@livekit/components-react";
import { ConnectionState } from "livekit-client";
import "@livekit/components-styles";
import Link from "next/link";
import { Mic } from "lucide-react";

function AgentControls({ onDisconnect }: { onDisconnect: () => void }) {
  const { state, audioTrack } = useVoiceAssistant();
  const roomInfo = useRoomInfo();
  const connectionState = useConnectionState();
  const participants = useParticipants();

  // Debug: Log all participants
  useEffect(() => {
    console.log("All participants:", participants);
    participants.forEach((p) => {
      console.log(`Participant: ${p.name} (${p.identity})`);
    });
  }, [participants]);

  console.log("Agent state:", state);
  console.log("Connection state:", connectionState);
  console.log("Audio track:", audioTrack);

  const getStateLabel = () => {
    switch (state) {
      case "connecting":
        return "Connecting to agent";
      case "initializing":
        return "Initializing";
      case "listening":
        return "Listening";
      case "thinking":
        return "Processing";
      case "speaking":
        return "Speaking";
      default:
        return "Ready";
    }
  };

  const getStateColor = () => {
    switch (state) {
      case "listening":
        return "bg-green-500";
      case "thinking":
        return "bg-yellow-500";
      case "speaking":
        return "bg-blue-500";
      case "connecting":
      case "initializing":
        return "bg-gray-400";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md">
      {/* Status Indicator */}
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full animate-pulse ${getStateColor()}`} />
        <span className="text-lg font-medium text-gray-700">
          {getStateLabel()}
        </span>
      </div>

      {/* Audio Visualizer */}
      {audioTrack && connectionState === ConnectionState.Connected && (
        <div className="w-full h-32 flex items-center justify-center bg-gray-100 rounded-lg p-4 border border-gray-200">
          <BarVisualizer
            state={state}
            barCount={15}
            track={audioTrack}
            className="w-full h-full"
          />
        </div>
      )}

      {/* Room Info */}
      {roomInfo.name && (
        <div className="text-sm text-gray-600 text-center">
          <p className="font-medium">{roomInfo.name}</p>
          <p className="text-xs text-gray-500">{participants.length} participant(s)</p>
        </div>
      )}

      {/* Voice Assistant Control Bar */}
      <VoiceAssistantControlBar />

      {/* Instructions */}
      <div className="text-center text-sm text-gray-600 max-w-sm">
        {connectionState === ConnectionState.Connected ? (
          <p>Start speaking to interact with the voice assistant.</p>
        ) : (
          <p>Connecting to voice assistant</p>
        )}
      </div>

      {/* Disconnect Button */}
      <button
        onClick={onDisconnect}
        className="mt-4 px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-full transition"
      >
        End Conversation
      </button>
    </div>
  );
}

export default function VoicePage() {
  const [token, setToken] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [canRender, setCanRender] = useState(false);

  const baseRoomName = "hospital-ward";
  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || "";

  console.log("serverUrl", serverUrl);

  const connectToAgent = useCallback(async () => {
    if (isConnecting || isConnected) return;

    setIsConnecting(true);
    setError("");

    try {
      const participantName = `staff-${Math.floor(Math.random() * 10000)}`;
      const response = await fetch(
        `/api/livekit-token?roomName=${encodeURIComponent(
          baseRoomName
        )}&participantName=${encodeURIComponent(participantName)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get access token");
      }

      const data = await response.json();
      setToken(data.token);
      setIsConnecting(false);
      setIsConnected(true);

      // Delay rendering to ensure clean mount
      setTimeout(() => setCanRender(true), 200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect");
      setIsConnecting(false);
    }
  }, [baseRoomName, isConnecting, isConnected]);

  const disconnect = useCallback(() => {
    // First prevent rendering
    setCanRender(false);

    // Clear token to unmount LiveKitRoom
    setToken("");

    // Wait for complete cleanup
    setTimeout(() => {
      setIsConnected(false);
      setIsConnecting(false);
    }, 1000);
  }, []);

  if (!serverUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8">
        <div className="max-w-md text-center">
          <p className="text-red-600 font-medium mb-2">Configuration Error</p>
          <p className="text-gray-600">
            Missing NEXT_PUBLIC_LIVEKIT_URL environment variable. Please add it to your .env file.
          </p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <nav className="fixed top-0 w-full bg-black text-white z-50 h-11 flex items-center px-8 border-b border-gray-800">
          <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
            <Link href="/" className="text-sm font-medium hover:text-gray-300">
              Hospital Ward Assistant
            </Link>
            <Link
              href="/dashboard"
              className="text-sm px-4 py-2 border border-gray-600 hover:border-gray-400 rounded-full transition"
            >
              Dashboard
            </Link>
          </div>
        </nav>

        <div className="pt-16 px-8 max-w-2xl w-full text-center">
          <h1 className="text-5xl font-semibold mb-6 leading-tight">
            Voice Assistant
          </h1>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            Connect to your AI-powered voice assistant. Click below to start a conversation about patient care.
          </p>
          <button
            onClick={connectToAgent}
            disabled={isConnecting}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            <Mic size={20} />
            {isConnecting ? "Connecting..." : "Start Conversation"}
          </button>
          {error && (
            <div className="text-red-600 text-sm max-w-md text-center mt-6">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isConnected && !canRender) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <nav className="fixed top-0 w-full bg-black text-white z-50 h-11 flex items-center px-8 border-b border-gray-800">
          <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
            <div className="text-sm font-medium">Hospital Ward Assistant</div>
          </div>
        </nav>
        <div className="pt-16 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full animate-pulse bg-gray-400" />
          <span className="text-lg font-medium text-gray-700">
            Initializing microphone
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <nav className="fixed top-0 w-full bg-black text-white z-50 h-11 flex items-center px-8 border-b border-gray-800">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <Link href="/" className="text-sm font-medium hover:text-gray-300">
            Hospital Ward Assistant
          </Link>
          <Link
            href="/dashboard"
            className="text-sm px-4 py-2 border border-gray-600 hover:border-gray-400 rounded-full transition"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      {token && canRender && (
        <LiveKitRoom
          key={token}
          token={token}
          serverUrl={serverUrl}
          connect={true}
          audio={{
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          }}
          video={false}
          onDisconnected={disconnect}
          onConnected={() => console.log("Connected to room")}
          onError={(error) => console.error("LiveKit error:", error)}
          className="flex flex-col items-center justify-center w-full h-screen pt-16"
        >
          <AgentControls onDisconnect={disconnect} />
          <RoomAudioRenderer />
        </LiveKitRoom>
      )}
    </div>
  );
}
