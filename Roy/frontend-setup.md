# Next.js Frontend Setup Guide

## Quick Setup

### 1. Create Next.js App

```bash
# From the Roy directory
npx create-next-app@latest hospital-dashboard --typescript --tailwind --app --no-src-dir
cd hospital-dashboard
```

When prompted:
- ✅ TypeScript: Yes
- ✅ ESLint: Yes
- ✅ Tailwind CSS: Yes
- ✅ App Router: Yes
- ❌ src/ directory: No
- ✅ Import alias: Yes (@/*)

### 2. Install Dependencies

```bash
npm install @livekit/components-react livekit-client
npm install recharts date-fns
npm install @tanstack/react-query
npm install lucide-react
```

### 3. Create Environment File

Create `hospital-dashboard/.env.local`:

```env
NEXT_PUBLIC_LIVEKIT_URL=wss://vriddhi-207ozxao.livekit.cloud
NEXT_PUBLIC_LIVEKIT_API_KEY=API2gHwJDppU78s
LIVEKIT_API_SECRET=nFs3ParB4Z6iUDA7Bz0LezSbWpEMK39LYC70AIxmeBC
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Project Structure

```
hospital-dashboard/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Main dashboard
│   ├── patients/
│   │   └── [id]/
│   │       └── page.tsx            # Patient detail
│   ├── voice/
│   │   └── page.tsx                # Voice interface
│   └── api/
│       ├── token/
│       │   └── route.ts            # LiveKit token generation
│       └── patients/
│           └── route.ts            # Patient API
├── components/
│   ├── VoiceInterface.tsx          # Main voice component
│   ├── PatientCard.tsx             # Patient summary
│   ├── VitalsChart.tsx             # Vital signs chart
│   ├── AlertBanner.tsx             # Emergency alerts
│   └── Sidebar.tsx                 # Navigation
├── lib/
│   ├── livekit.ts                  # LiveKit utilities
│   ├── api.ts                      # API client
│   └── types.ts                    # TypeScript types
└── hooks/
    ├── usePatients.ts              # Patient data hook
    └── useVoiceAgent.ts            # Voice agent hook
```

## Core Components

### 1. LiveKit Token API Route

Create `app/api/token/route.ts`:

```typescript
import { AccessToken } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const room = request.nextUrl.searchParams.get('room');
  const username = request.nextUrl.searchParams.get('username');

  if (!room || !username) {
    return NextResponse.json(
      { error: 'Missing room or username' },
      { status: 400 }
    );
  }

  const apiKey = process.env.NEXT_PUBLIC_LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json(
      { error: 'Server misconfigured' },
      { status: 500 }
    );
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: username,
  });

  at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true });

  return NextResponse.json({ token: at.toJwt() });
}
```

### 2. Voice Interface Component

Create `components/VoiceInterface.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import {
  LiveKitRoom,
  useVoiceAssistant,
  BarVisualizer,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Mic, MicOff } from 'lucide-react';

function VoiceAssistantUI() {
  const { state, audioTrack } = useVoiceAssistant();
  const [transcript, setTranscript] = useState<string[]>([]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          🏥 Hospital Voice Assistant
        </h1>

        {/* Status Indicator */}
        <div className="flex items-center justify-center mb-6">
          <div
            className={`w-4 h-4 rounded-full mr-3 ${
              state === 'listening'
                ? 'bg-green-500 animate-pulse'
                : state === 'thinking'
                ? 'bg-yellow-500 animate-pulse'
                : state === 'speaking'
                ? 'bg-blue-500 animate-pulse'
                : 'bg-gray-300'
            }`}
          />
          <span className="text-lg font-medium text-gray-700 capitalize">
            {state}
          </span>
        </div>

        {/* Audio Visualizer */}
        {audioTrack && (
          <div className="mb-6">
            <BarVisualizer
              state={state}
              barCount={5}
              trackRef={audioTrack}
              className="h-24"
            />
          </div>
        )}

        {/* Control Bar */}
        <VoiceAssistantControlBar />

        {/* Transcript */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">
            Conversation
          </h3>
          {transcript.length === 0 ? (
            <p className="text-gray-400 text-sm">
              Start speaking to interact with the assistant...
            </p>
          ) : (
            <div className="space-y-2">
              {transcript.map((msg, idx) => (
                <p key={idx} className="text-sm text-gray-700">
                  {msg}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Quick Commands */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">
            Try saying:
          </h3>
          <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
            <div className="bg-blue-50 p-2 rounded">
              "Update bed 12 oxygen to 96"
            </div>
            <div className="bg-blue-50 p-2 rounded">
              "What's the status of bed 12?"
            </div>
            <div className="bg-blue-50 p-2 rounded">
              "Mark insulin administered to bed 12"
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VoiceInterface() {
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    // Get LiveKit token
    const getToken = async () => {
      const response = await fetch(
        `/api/token?room=hospital-ward&username=staff-${Date.now()}`
      );
      const data = await response.json();
      setToken(data.token);
    };

    getToken();
  }, []);

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      connect={true}
      audio={true}
      video={false}
    >
      <VoiceAssistantUI />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}
```

### 3. Patient Dashboard

Create `app/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, AlertCircle, Mic } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  bed: string;
  vitals: {
    temperature: number;
    bp: string;
    oxygen: number;
    heart_rate: number;
  };
  status: 'stable' | 'warning' | 'critical';
}

export default function Dashboard() {
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: 'bed_12',
      name: 'John Doe',
      bed: 'Bed 12',
      vitals: {
        temperature: 98.6,
        bp: '140/90',
        oxygen: 95,
        heart_rate: 78,
      },
      status: 'stable',
    },
    {
      id: 'ward_b_3',
      name: 'Jane Smith',
      bed: 'Ward B-3',
      vitals: {
        temperature: 99.2,
        bp: '120/80',
        oxygen: 98,
        heart_rate: 72,
      },
      status: 'stable',
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              🏥 Hospital Ward Dashboard
            </h1>
            <Link
              href="/voice"
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Mic size={20} />
              Voice Assistant
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Activity className="text-blue-600 mr-3" size={32} />
              <div>
                <p className="text-gray-500 text-sm">Total Patients</p>
                <p className="text-2xl font-bold">{patients.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <AlertCircle className="text-green-600 mr-3" size={32} />
              <div>
                <p className="text-gray-500 text-sm">Stable</p>
                <p className="text-2xl font-bold">
                  {patients.filter((p) => p.status === 'stable').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <AlertCircle className="text-red-600 mr-3" size={32} />
              <div>
                <p className="text-gray-500 text-sm">Critical</p>
                <p className="text-2xl font-bold">
                  {patients.filter((p) => p.status === 'critical').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Patient List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Patients</h2>
          </div>
          <div className="divide-y">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="px-6 py-4 hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{patient.name}</h3>
                    <p className="text-gray-500">{patient.bed}</p>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Temp</p>
                      <p className="font-semibold">
                        {patient.vitals.temperature}°F
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">BP</p>
                      <p className="font-semibold">{patient.vitals.bp}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">O2</p>
                      <p className="font-semibold">{patient.vitals.oxygen}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">HR</p>
                      <p className="font-semibold">
                        {patient.vitals.heart_rate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
```

### 4. Install LiveKit Server SDK

```bash
npm install livekit-server-sdk
```

## Running the Full Stack

### Terminal 1: Backend (Voice Agent)
```bash
cd Roy
uv run src\hospital_agent.py dev
```

### Terminal 2: Frontend (Next.js)
```bash
cd Roy/hospital-dashboard
npm run dev
```

### Access Points
- **Dashboard:** http://localhost:3000
- **Voice Interface:** http://localhost:3000/voice
- **LiveKit Console:** https://cloud.livekit.io

## Next Steps

1. ✅ Set up the Next.js app
2. ✅ Create the voice interface
3. ✅ Build the dashboard
4. Add real-time updates with WebSockets
5. Integrate with backend API
6. Add authentication
7. Deploy to production

## Troubleshooting

**CORS issues:**
Add to your backend API:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**LiveKit connection issues:**
- Verify environment variables
- Check API key and secret
- Ensure agent is running

**Build errors:**
```bash
rm -rf node_modules package-lock.json
npm install
```
