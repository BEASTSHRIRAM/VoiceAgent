"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

export default function SeedPage() {
  const seedData = useMutation(api.seed.seedData);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSeed = async () => {
    setLoading(true);
    try {
      const res = await seedData();
      setResult(res);
    } catch (error) {
      setResult({ error: String(error) });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Seed Database</h1>
        <button
          onClick={handleSeed}
          disabled={loading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? "Seeding..." : "Seed Patients"}
        </button>

        {result && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}

        <a
          href="/"
          className="block mt-4 text-center text-blue-600 hover:underline"
        >
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}
