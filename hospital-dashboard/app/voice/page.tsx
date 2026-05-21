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
import { ConnectionState, Participant } from "livekit-client";
import "@livekit/components-styles";
import Link from "next/link";

function AgentControls({ onDisconnect }: { onDisconnect: () => void }) {
  const { state, audioTrack } = useVoiceAssistant();
  const roomInfo = useRoomInfo();
  const connectionState = useConnectionState();
  const participants = useParticipants();

  // Debug: Log all participants and their tracks
  useEffect(() => {
    console.log("All participants:", participants);
    participants.forEach((p) => {
      console.log(`Participant: ${p.name} (${p.identity})`, {
        audioTracks: p.audioTracks,
        videoTracks: p.videoTracks,
        isAgent: p.isAgent,
      });
    });
  }, [participants]);

  console.log("Agent state:", state);
  console.log("Connection state:", connectionState);
  console.log("Audio track:", audioTrack);

  const getStateLabel = () => {
    switch (state) {
      case "connecting":
        return "Connecting to agent...";
      case "initializing":
        return "Initializing...";
      case "listening":
        return "Listening";
      case "thinking":
        return "Thinking...";
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
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      {/* Status Indicator */}
      <div className="flex items-center gap-3">
        <div className={`w-4 h-4 rounded-full animate-pulse ${getStateColor()}`} />
        <span className="text-lg font-medium text-gray-700">
          {getStateLabel()}
        </span>
      </div>

      {/* Audio Visualizer */}
      {audioTrack && connectionState === ConnectionState.Connected && (
        <div className="w-full h-32 flex items-center justify-center bg-gray-100 rounded-xl p-4 border border-gray-200">
          <BarVisualizer
            state={state}
            barCount={15}
            trackRef={audioTrack}
            className="w-full h-full"
          />
        </div>
      )}

      {/* Room Info */}
      {roomInfo.name && (
        <div className="text-sm text-gray-600">
          <p>Room: {roomInfo.name}</p>
          <p>Participants: {participants.length}</p>
        </div>
      )}

      {/* Voice Assistant Control Bar */}
      <VoiceAssistantControlBar />

      {/* Instructions */}
      <div className="text-center text-sm text-gray-600 max-w-sm">
        {connectionState === ConnectionState.Connected ? (
          <p>Start speaking to interact with your AI voice assistant.</p>
        ) : (
          <p>Connecting to your voice assistant...</p>
        )}
      </div>

      {/* Disconnect Button */}
      <button
        onClick={onDisconnect}
        className="mt-4 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
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
      <div className="flex flex-col items-center justify-center p-8 bg-red-100 rounded-xl border border-red-300">
        <p className="text-red-700 text-center">
          Missing NEXT_PUBLIC_LIVEKIT_URL environment variable.
          <br />
          Please add it to your .env file.
        </p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            🏥 Hospital Voice Assistant
          </h2>
          <p className="text-center text-gray-600 max-w-md mb-8 mx-auto">
            Connect to your AI-powered voice assistant. Click the button below
            to start a conversation.
          </p>
          <button
            onClick={connectToAgent}
            disabled={isConnecting}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? "Connecting..." : "Start Conversation"}
          </button>
          {error && (
            <div className="text-red-600 text-sm max-w-md text-center mt-4">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show initializing state when connected but not ready to render
  if (isConnected && !canRender) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full animate-pulse bg-gray-400" />
          <span className="text-lg font-medium text-gray-700">
            Initializing microphone...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
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
          className="flex flex-col items-center gap-6 w-full"
        >
          <AgentControls onDisconnect={disconnect} />
          <RoomAudioRenderer />
        </LiveKitRoom>
      )}
    </div>
  );
}
