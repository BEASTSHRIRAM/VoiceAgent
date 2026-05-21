# Building a LiveKit Voice Agent: Complete Tutorial

A comprehensive guide to building production-ready voice agents with LiveKit, from setup to deployment. This tutorial covers the Hospital Ward Voice Assistant project and includes common pitfalls to avoid.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Phase 1: Project Setup](#phase-1-project-setup)
4. [Phase 2: Backend Setup (Agent)](#phase-2-backend-setup-agent)
5. [Phase 3: Frontend Setup](#phase-3-frontend-setup)
6. [Phase 4: Database Integration](#phase-4-database-integration)
7. [Phase 5: Testing & Debugging](#phase-5-testing--debugging)
8. [Phase 6: Deployment](#phase-6-deployment)
9. [Common Issues & Solutions](#common-issues--solutions)
10. [Best Practices](#best-practices)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                       │
│  - Voice UI with LiveKit Components                         │
│  - Token generation endpoint                                │
│  - Real-time audio visualization                            │
└────────────────────┬────────────────────────────────────────┘
                     │ WebRTC
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              LiveKit Server (Cloud)                         │
│  - Room management                                          │
│  - Audio routing                                            │
│  - Agent dispatch                                           │
└────────────────────┬────────────────────────────────────────┘
                     │ WebRTC
                     ▼
┌─────────────────────────────────────────────────────────────┐
│            Agent Backend (Python/LiveKit)                   │
│  - Speech-to-text (Deepgram)                                │
│  - LLM (OpenAI GPT-4)                                       │
│  - Text-to-speech (Cartesia)                                │
│  - Tool execution (Function tools)                          │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Database (Convex)                              │
│  - Patient records                                          │
│  - Vitals, medications, alerts                              │
│  - Real-time sync                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

### Required Services
- **LiveKit Cloud Account** - https://livekit.io (free tier available)
- **OpenAI API Key** - https://platform.openai.com
- **Deepgram API Key** - https://deepgram.com (STT)
- **Cartesia API Key** - https://cartesia.ai (TTS)
- **Convex Account** - https://convex.dev (database)

### Local Tools
- Python 3.10+
- Node.js 18+
- npm or yarn
- Docker (for deployment)
- Git

### Knowledge Requirements
- Basic Python async/await
- React hooks
- REST APIs
- WebRTC concepts (basic understanding)

---

## Phase 1: Project Setup

### Step 1.1: Create Project Structure

```bash
mkdir hospital-voice-agent
cd hospital-voice-agent

# Backend (Agent)
mkdir Roy
cd Roy
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Frontend
cd ..
npx create-next-app@latest hospital-dashboard
```

### Step 1.2: Initialize Backend

```bash
cd Roy
pip install livekit-agents livekit-agents-openai livekit-agents-deepgram livekit-agents-cartesia python-dotenv httpx
```

### Step 1.3: Create `.env.local` Files

**Roy/.env.local:**
```env
# LiveKit
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
LIVEKIT_URL=wss://your-livekit-url

# AI Services
OPENAI_API_KEY=sk-...
DEEPGRAM_API_KEY=...
CARTESIA_API_KEY=...

# Database
CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=dev:your-deployment|...
```

**hospital-dashboard/.env.local:**
```env
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-url
CONVEX_URL=https://your-deployment.convex.cloud
```

---

## Phase 2: Backend Setup (Agent)

### Step 2.1: Create Agent Structure

```
Roy/
├── src/
│   ├── agent.py          # Main agent logic
│   ├── convex_client.py  # Database client
│   └── __init__.py
├── pyproject.toml        # Dependencies
├── livekit.toml          # LiveKit config
└── .env.local            # Environment variables
```

### Step 2.2: Create `pyproject.toml`

```toml
[project]
name = "hospital-agent"
version = "0.1.0"
description = "Hospital Ward Voice Assistant"

dependencies = [
    "livekit-agents[openai,deepgram,cartesia,silero,turn-detector-multilingual]",
    "python-dotenv",
    "httpx",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
```

### Step 2.3: Create `livekit.toml`

```toml
[agent]
name = "hospital-assistant"
entry_point = "src.agent:prewarm"
```

### Step 2.4: Implement Agent

**Key Components:**

```python
import logging
import os
from dotenv import load_dotenv
from livekit.agents import Agent, AgentServer, AgentSession, JobContext, function_tool
from livekit.plugins import openai, deepgram, cartesia, silero

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("hospital-agent")
load_dotenv(".env.local")

# 1. Database Client (Lazy Initialization)
class ConvexClient:
    def __init__(self):
        self.deployment_url = os.getenv("CONVEX_URL")
        if not self.deployment_url:
            raise ValueError("CONVEX_URL must be set")
        self.deployment_url = self.deployment_url.rstrip("/")
        # Initialize HTTP client
    
    async def _query(self, function_name: str, args: dict = None):
        """Execute Convex query with proper error handling"""
        url = f"{self.deployment_url}/api/query"
        payload = {
            "path": function_name,
            "args": args or {}
        }
        # Make request and handle response

# 2. Lazy Client Initialization (CRITICAL!)
convex_client = None

def get_convex_client():
    global convex_client
    if convex_client is None:
        convex_client = ConvexClient()
    return convex_client

# 3. Agent Definition
class HospitalAssistant(Agent):
    def __init__(self):
        super().__init__(
            llm=openai.LLM(model="gpt-4o"),
            instructions="Your system prompt here..."
        )
    
    @function_tool
    async def get_patient_info(self, context, patient_identifier: str):
        """Tool to retrieve patient data"""
        client = get_convex_client()
        # Normalize input
        normalized_id = patient_identifier.lower().replace("bed", "").strip()
        # Query and return
```

---

## Phase 3: Frontend Setup

### Step 3.1: Install LiveKit Components

```bash
cd hospital-dashboard
npm install @livekit/components-react livekit-client
```

### Step 3.2: Create Token Generation Endpoint

**app/api/livekit-token/route.ts:**

```typescript
import { AccessToken } from "livekit-server-sdk";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomName = searchParams.get("roomName");
  const participantName = searchParams.get("participantName");

  if (!roomName || !participantName) {
    return Response.json({ error: "Missing parameters" }, { status: 400 });
  }

  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET
  );

  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  });

  token.identity = participantName;

  return Response.json({ token: token.toJwt() });
}
```

### Step 3.3: Create Voice Page

**app/voice/page.tsx:**

```typescript
"use client";

import { useState, useCallback } from "react";
import {
  LiveKitRoom,
  useVoiceAssistant,
  BarVisualizer,
  VoiceAssistantControlBar,
} from "@livekit/components-react";
import { ConnectionState } from "livekit-client";

export default function VoicePage() {
  const [token, setToken] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);

  const connectToAgent = useCallback(async () => {
    setIsConnecting(true);
    try {
      const response = await fetch(
        `/api/livekit-token?roomName=hospital-ward&participantName=staff-${Math.random()}`
      );
      const data = await response.json();
      setToken(data.token);
    } catch (err) {
      console.error("Failed to connect:", err);
    }
    setIsConnecting(false);
  }, []);

  if (!token) {
    return (
      <button onClick={connectToAgent} disabled={isConnecting}>
        {isConnecting ? "Connecting..." : "Start Conversation"}
      </button>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      connect={true}
      audio={{ echoCancellation: true, noiseSuppression: true }}
      video={false}
    >
      <VoiceAssistantControlBar />
      <BarVisualizer />
    </LiveKitRoom>
  );
}
```

---

## Phase 4: Database Integration

### Step 4.1: Set Up Convex Schema

**convex/schema.ts:**

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  patients: defineTable({
    patientId: v.string(),
    name: v.string(),
    age: v.number(),
    bedNumber: v.string(),
    ward: v.string(),
    diagnosis: v.string(),
    allergies: v.array(v.string()),
  }).index("by_bed", ["bedNumber"]),

  vitalSigns: defineTable({
    patientId: v.string(),
    temperature: v.number(),
    bpSystolic: v.number(),
    bpDiastolic: v.number(),
    oxygenSaturation: v.number(),
    heartRate: v.number(),
    recordedAt: v.string(),
  }).index("by_patient", ["patientId"]),

  medications: defineTable({
    patientId: v.string(),
    name: v.string(),
    dosage: v.string(),
    frequency: v.string(),
    active: v.boolean(),
  }).index("by_patient", ["patientId", "active"]),
});
```

### Step 4.2: Create Query Functions

**convex/patients.ts:**

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getPatientByBed = query({
  args: { bedNumber: v.string() },
  visibility: "public",
  handler: async (ctx, args) => {
    const patient = await ctx.db
      .query("patients")
      .withIndex("by_bed", (q) => q.eq("bedNumber", args.bedNumber))
      .first();

    if (!patient) return null;

    const vitals = await ctx.db
      .query("vitalSigns")
      .withIndex("by_patient", (q) => q.eq("patientId", patient.patientId))
      .order("desc")
      .first();

    const medications = await ctx.db
      .query("medications")
      .withIndex("by_patient", (q) =>
        q.eq("patientId", patient.patientId).eq("active", true)
      )
      .collect();

    return { ...patient, vitals, medications };
  },
});
```

### Step 4.3: Seed Data

**convex/seed.ts:**

```typescript
export const seedData = mutation({
  visibility: "public",
  handler: async (ctx) => {
    // Clear old data
    const patients = await ctx.db.query("patients").collect();
    for (const p of patients) await ctx.db.delete(p._id);

    // Insert new data
    await ctx.db.insert("patients", {
      patientId: "P102",
      name: "John Doe",
      age: 65,
      bedNumber: "1",
      ward: "General Ward A",
      diagnosis: "Type 2 Diabetes",
      allergies: ["Penicillin"],
    });
  },
});
```

---

## Phase 5: Testing & Debugging

### Step 5.1: Test Convex Connection

```bash
# Test with curl
curl -X POST https://your-deployment.convex.cloud/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "path": "patients:getPatientByBed",
    "args": {"bedNumber": "1"}
  }'
```

### Step 5.2: Local Agent Testing

```bash
cd Roy
lk agent dev
```

### Step 5.3: Frontend Testing

```bash
cd hospital-dashboard
npm run dev
# Visit http://localhost:3000/voice
```

### Step 5.4: Check Logs

```bash
# LiveKit agent logs
lk agent logs

# Frontend console
# Browser DevTools → Console tab
```

---

## Phase 6: Deployment

### Step 6.1: Deploy Agent

```bash
cd Roy
lk agent deploy
```

### Step 6.2: Deploy Frontend

```bash
cd hospital-dashboard
npm run build
# Deploy to Vercel, Netlify, or your hosting
```

---

## Common Issues & Solutions

### ❌ Issue 1: "CONVEX_URL not set in environment"

**Cause:** Environment variables not passed to Docker build

**Solution:**
```python
# Use lazy initialization
convex_client = None

def get_convex_client():
    global convex_client
    if convex_client is None:
        convex_client = ConvexClient()
    return convex_client

# Use in tools
client = get_convex_client()
```

### ❌ Issue 2: "400 Bad Request" from Convex API

**Cause:** Wrong API endpoint format

**Solution:**
```python
# WRONG:
url = f"{deployment_url}/api/query/{path}"

# CORRECT:
url = f"{deployment_url}/api/query"
payload = {
    "path": "patients:getPatientByBed",
    "args": {"bedNumber": "1"}
}
```

### ❌ Issue 3: Agent Not Finding Patients

**Cause:** Bed number normalization issues

**Solution:**
```python
# Normalize input properly
normalized_id = patient_identifier.lower() \
    .replace("bed", "") \
    .replace("_", "") \
    .strip()

# "bed 10" → "10"
# "bed_12" → "12"
# "10" → "10"
```

### ❌ Issue 4: Duplicate Data After Seeding

**Cause:** Seed function not clearing old data

**Solution:**
```typescript
// Always clear before inserting
const existing = await ctx.db.query("patients").collect();
for (const p of existing) await ctx.db.delete(p._id);

// Then insert fresh data
```

### ❌ Issue 5: Agent Not Responding to Queries

**Cause:** Tool not being called with correct parameters

**Solution:**
```python
# Update system instructions to guide LLM
instructions = """
When asked about medications, use info_type="medications"
When asked about vitals, use info_type="vitals"
When asked for full details, use info_type="all"
"""
```

### ❌ Issue 6: WebRTC Connection Fails

**Cause:** Token generation endpoint not working

**Solution:**
```typescript
// Verify token endpoint
// 1. Check LIVEKIT_API_KEY and LIVEKIT_API_SECRET
// 2. Verify room name matches agent dispatch
// 3. Check NEXT_PUBLIC_LIVEKIT_URL is set
```

### ❌ Issue 7: Audio Not Working

**Cause:** Missing audio permissions or device issues

**Solution:**
```typescript
// Request permissions
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

// Check browser console for errors
// Verify microphone is not muted
```

---

## Best Practices

### 1. **Environment Variables**
```bash
# ✅ DO: Use .env.local for secrets
CONVEX_URL=https://...
OPENAI_API_KEY=sk-...

# ❌ DON'T: Hardcode URLs
self.deployment_url = "https://..."
```

### 2. **Error Handling**
```python
# ✅ DO: Catch and log errors
try:
    result = await client.query(...)
except Exception as e:
    logger.error(f"Query failed: {e}")
    return None

# ❌ DON'T: Ignore errors
result = await client.query(...)
```

### 3. **Logging**
```python
# ✅ DO: Log at appropriate levels
logger.debug(f"Querying: {path}")
logger.info(f"Patient found: {name}")
logger.error(f"Connection failed: {e}")

# ❌ DON'T: Use print()
print("Debug info")
```

### 4. **Tool Design**
```python
# ✅ DO: Make tools specific and focused
@function_tool
async def get_patient_info(self, patient_id: str, info_type: str):
    """Get specific patient information"""

# ❌ DON'T: Make tools too generic
@function_tool
async def query_database(self, query: str):
    """Execute any query"""
```

### 5. **Async/Await**
```python
# ✅ DO: Use async for I/O operations
async def get_patient_by_bed(self, bed_number: str):
    response = await self.client.post(url, json=payload)

# ❌ DON'T: Block with sync calls
response = requests.post(url, json=payload)
```

### 6. **Testing**
```bash
# ✅ DO: Test each component
# Test Convex API with curl
# Test agent locally with lk agent dev
# Test frontend with npm run dev

# ❌ DON'T: Deploy without testing
```

### 7. **Data Normalization**
```python
# ✅ DO: Normalize user input
bed_number = user_input.lower().replace("bed", "").strip()

# ❌ DON'T: Use raw input
bed_number = user_input
```

### 8. **System Prompts**
```python
# ✅ DO: Be specific about tool usage
instructions = """
When asked about medications, call get_patient_info with info_type="medications"
Always confirm critical actions before executing
"""

# ❌ DON'T: Be vague
instructions = "Help the user"
```

---

## Performance Optimization

### 1. **Caching**
```python
# Cache patient lookups
self.patient_cache = {}

async def get_patient_by_bed(self, bed_number):
    if bed_number in self.patient_cache:
        return self.patient_cache[bed_number]
    
    result = await self._query(...)
    self.patient_cache[bed_number] = result
    return result
```

### 2. **Batch Operations**
```python
# Get multiple patients at once
async def get_patients_by_beds(self, bed_numbers: list):
    tasks = [self.get_patient_by_bed(b) for b in bed_numbers]
    return await asyncio.gather(*tasks)
```

### 3. **Connection Pooling**
```python
# Reuse HTTP client
self.client = httpx.AsyncClient(timeout=30.0)
# Don't create new client for each request
```

---

## Monitoring & Debugging

### 1. **Enable Debug Logging**
```python
logging.basicConfig(level=logging.DEBUG)
```

### 2. **Monitor Agent Health**
```bash
lk agent logs --follow
```

### 3. **Check LiveKit Dashboard**
- Visit https://dashboard.livekit.io
- Monitor active rooms and participants
- Check bandwidth usage

### 4. **Frontend Debugging**
```typescript
// Enable detailed logging
console.log("Agent state:", state);
console.log("Connection state:", connectionState);
console.log("Participants:", participants);
```

---

## Deployment Checklist

- [ ] All environment variables set
- [ ] Convex schema deployed
- [ ] Seed data loaded
- [ ] Agent tested locally
- [ ] Frontend tested locally
- [ ] API endpoints verified
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Security review done
- [ ] Performance tested
- [ ] Agent deployed
- [ ] Frontend deployed
- [ ] End-to-end testing completed

---

## Resources

- **LiveKit Docs:** https://docs.livekit.io
- **LiveKit Agents:** https://docs.livekit.io/agents
- **Convex Docs:** https://docs.convex.dev
- **OpenAI API:** https://platform.openai.com/docs
- **Deepgram STT:** https://developers.deepgram.com
- **Cartesia TTS:** https://docs.cartesia.ai

---

## Summary

Building a production voice agent requires:

1. **Proper Setup** - Environment variables, dependencies, services
2. **Lazy Initialization** - Don't initialize clients at module load
3. **Correct API Formats** - Verify endpoint formats with curl
4. **Input Normalization** - Handle user input variations
5. **Error Handling** - Catch and log all errors
6. **Testing** - Test each component independently
7. **Monitoring** - Log and monitor in production

Follow these practices and you'll avoid 90% of common issues!

---

**Last Updated:** May 2026  
**Project:** Hospital Ward Voice Assistant  
**Status:** Production Ready ✅
