"use client";

import { useState } from "react";

export default function DebugPage() {
  const [token, setToken] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const getToken = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/livekit-token?room=hospital-ward&username=debug-user-${Date.now()}`
      );
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setToken(data.token);
      }
    } catch (err) {
      setError(String(err));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Debug LiveKit Token</h1>

        <button
          onClick={getToken}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition mb-4"
        >
          {loading ? "Generating..." : "Generate Token"}
        </button>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {token && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p className="font-bold mb-2">Token Generated:</p>
            <div className="bg-white text-gray-800 p-3 rounded font-mono text-xs break-all max-h-40 overflow-y-auto">
              {token}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(token)}
              className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              Copy Token
            </button>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h2 className="font-bold mb-2">Environment Check:</h2>
          <div className="text-sm space-y-1">
            <p>
              NEXT_PUBLIC_LIVEKIT_URL:{" "}
              {process.env.NEXT_PUBLIC_LIVEKIT_URL || "NOT SET"}
            </p>
            <p>
              NEXT_PUBLIC_CONVEX_URL:{" "}
              {process.env.NEXT_PUBLIC_CONVEX_URL || "NOT SET"}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="font-bold mb-2">Next Steps:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Generate a token above</li>
            <li>
              Go to{" "}
              <a
                href="https://cloud.livekit.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                LiveKit Cloud Console
              </a>
            </li>
            <li>Create a new room called "hospital-ward"</li>
            <li>Use the token to join the room</li>
            <li>Check if you can connect</li>
          </ol>
        </div>

        <a href="/" className="block mt-6 text-blue-600 hover:underline">
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}
