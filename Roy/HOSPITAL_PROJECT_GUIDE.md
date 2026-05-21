# Hospital Ward Voice Assistant - Complete Project Guide

## 🏥 Project Overview

A hands-free voice assistant for hospital wards that helps doctors and nurses:
- Update patient vitals without typing
- Retrieve patient information instantly
- Handle emergency alerts
- Record medication administration
- Maintain conversation context

## 🎯 What's Been Built

### ✅ Phase 1: Core Voice Agent (COMPLETE)

**File: `src/hospital_agent.py`**

Features implemented:
- ✅ Voice-to-text with medical vocabulary support
- ✅ Context-aware patient tracking
- ✅ 5 core tools:
  1. Update patient vitals
  2. Get patient information
  3. Record medication administration
  4. Send emergency alerts
  5. Contextual patient queries
- ✅ Interruption handling
- ✅ Noise cancellation for hospital environments
- ✅ Mock database with sample patients

### ✅ Database Structure (READY)

**File: `src/database/models.py`**

Includes:
- ✅ Data models for patients, vitals, medications, alerts
- ✅ Database interface specification
- ✅ PostgreSQL implementation example
- ✅ Complete SQL schema

## 🚀 Quick Start

### 1. Set Up Environment

```bash
# Make sure you're in the Roy directory
cd Roy

# Add your OpenAI API key to .env.local
# Edit .env.local and replace "your-openai-api-key-here" with your actual key
```

### 2. Run the Hospital Agent

```bash
# Download required models (if not done already)
uv run src\agent.py download-files

# Start the hospital voice assistant
uv run src\hospital_agent.py dev
```

### 3. Access the Agent

Open your browser to:
```
https://cloud.livekit.io/projects/p_/agents/console/?autoStart=true&agentName=hospital-assistant
```

Or go to your LiveKit dashboard → Agents → Playground

## 🎤 Voice Commands to Try

### Update Vitals
- "Update bed 12 oxygen saturation to 96"
- "Patient in ward B has fever 101"
- "Set BP to 140 over 90 for bed 12"

### Get Information
- "What's the status of bed 12?"
- "Show me vitals for ward B patient"
- "When is the next medication?"
- "Read patient history for bed 12"

### Contextual Queries (After mentioning a patient)
- "What about his BP?"
- "Show her medications"
- "What's the latest temperature?"

### Record Medications
- "Mark insulin administered to bed 12"
- "Given metformin 500mg to ward B patient"

### Emergency Alerts
- "Code blue in ICU bed 4"
- "Emergency in ward B"
- "Call duty doctor for bed 12"

## 📊 Current Mock Data

The system has 2 sample patients:

**Bed 12 (John Doe)**
- Age: 65
- Diagnosis: Type 2 Diabetes, Hypertension
- Vitals: Temp 98.6°F, BP 140/90, O2 95%, HR 78

**Ward B 3 (Jane Smith)**
- Age: 42
- Diagnosis: Post-operative recovery
- Vitals: Temp 99.2°F, BP 120/80, O2 98%, HR 72

## 🔧 Next Steps: Building the Full System

### Phase 2: Database Integration

**What to do:**
1. Set up PostgreSQL database
2. Run the SQL schema from `src/database/models.py`
3. Replace mock database in `hospital_agent.py` with real database calls
4. Add authentication for medical staff

**Files to modify:**
- `src/hospital_agent.py` - Replace `PatientDatabase` class
- Create `src/database/connection.py` - Database connection pool
- Create `.env.local` entries for database credentials

**Example:**
```python
# In hospital_agent.py
from database.models import PostgreSQLDatabase

# Initialize real database
db = PostgreSQLDatabase(os.getenv("DATABASE_URL"))
await db.connect()
```

### Phase 3: Next.js Dashboard Frontend

**Create a new Next.js app:**
```bash
# In the Roy directory
npx create-next-app@latest hospital-dashboard
cd hospital-dashboard
npm install livekit-client livekit-react
```

**Dashboard Features to Build:**

1. **Real-time Patient Monitor**
   - Live vital signs display
   - Patient list with status indicators
   - Alert notifications

2. **Voice Interface Component**
   - LiveKit room connection
   - Push-to-talk or always-on mode
   - Visual feedback during speech
   - Transcript display

3. **Patient Detail View**
   - Full patient information
   - Vital signs charts (use Chart.js or Recharts)
   - Medication schedule
   - Recent updates log

4. **Emergency Alert Dashboard**
   - Active alerts display
   - Alert history
   - Response time tracking

**Key Files to Create:**

```
hospital-dashboard/
├── app/
│   ├── page.tsx                 # Main dashboard
│   ├── patients/[id]/page.tsx   # Patient detail view
│   └── alerts/page.tsx          # Emergency alerts
├── components/
│   ├── VoiceInterface.tsx       # LiveKit voice component
│   ├── PatientCard.tsx          # Patient summary card
│   ├── VitalsChart.tsx          # Vital signs visualization
│   └── AlertBanner.tsx          # Emergency alert display
├── lib/
│   ├── livekit.ts               # LiveKit configuration
│   └── api.ts                   # Backend API calls
└── hooks/
    ├── usePatients.ts           # Patient data hook
    └── useVoiceAgent.ts         # Voice agent hook
```

**Example Voice Interface Component:**

```typescript
// components/VoiceInterface.tsx
'use client';

import { useVoiceAssistant } from '@livekit/components-react';
import { useState } from 'react';

export function VoiceInterface() {
  const { state, audioTrack } = useVoiceAssistant();
  const [transcript, setTranscript] = useState('');

  return (
    <div className="voice-interface">
      <button 
        className={state === 'listening' ? 'active' : ''}
        onClick={() => /* toggle voice */}
      >
        {state === 'listening' ? '🎤 Listening...' : '🎤 Start Voice'}
      </button>
      
      <div className="transcript">
        {transcript}
      </div>
      
      <div className="status">
        Status: {state}
      </div>
    </div>
  );
}
```

### Phase 4: Advanced Features

**4.1 Real-time Notifications**
- WebSocket connection for live updates
- Push notifications for emergencies
- SMS alerts for critical events

**4.2 Analytics Dashboard**
- Patient vital trends
- Medication adherence tracking
- Response time metrics
- Staff activity logs

**4.3 Multi-language Support**
- Update STT model to support multiple languages
- Add language detection
- Localized responses

**4.4 Mobile App**
- React Native version
- Tablet-optimized interface
- Offline mode support

**4.5 Advanced AI Features**
- Emotion detection in voice
- Stress level monitoring
- Predictive alerts (vital sign trends)
- Natural language report generation

## 🏗️ Architecture

```
┌─────────────────┐
│  Doctor/Nurse   │
│   (Voice Input) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  LiveKit Room   │
│  (Audio Stream) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Deepgram STT  │
│  (Speech→Text)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   GPT-4 Agent   │
│  (Understanding │
│   & Reasoning)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Tool Router    │
├─────────────────┤
│ • Update Vitals │
│ • Get Patient   │
│ • Record Meds   │
│ • Emergency     │
│ • Context Query │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │
│   (Patient DB)  │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Cartesia TTS   │
│  (Text→Speech)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Doctor/Nurse   │
│  (Audio Output) │
└─────────────────┘
```

## 🔐 Security Considerations

**Before Production:**

1. **Authentication**
   - Implement staff authentication
   - Role-based access control (doctor, nurse, admin)
   - Session management

2. **HIPAA Compliance**
   - Encrypt all patient data
   - Audit logs for all access
   - Secure data transmission (TLS)
   - Data retention policies

3. **Privacy**
   - No recording of voice conversations (unless required)
   - Anonymize logs
   - Secure API endpoints

4. **Validation**
   - Verify critical actions (medication, emergency alerts)
   - Input sanitization
   - Rate limiting

## 📦 Tech Stack

**Current:**
- LiveKit (Real-time audio)
- Deepgram Nova-3 (Speech-to-Text)
- OpenAI GPT-4 (Language Model)
- Cartesia Sonic-3 (Text-to-Speech)
- Python 3.12
- Silero VAD (Voice Activity Detection)

**Recommended Additions:**
- PostgreSQL (Database)
- Redis (Caching & real-time)
- Next.js 14+ (Frontend)
- FastAPI (REST API backend)
- WebSockets (Real-time updates)
- Docker (Deployment)

## 🧪 Testing

**Test the voice agent:**
```bash
# Run with debug logging
uv run src\hospital_agent.py dev --log-level debug
```

**Test scenarios:**
1. Update vitals for multiple patients
2. Ask contextual questions
3. Trigger emergency alert
4. Record medication administration
5. Test interruption handling

## 📝 Customization

**Add new tools:**
```python
@function_tool
async def your_new_tool(
    self,
    context: RunContext,
    param: Annotated[str, "Description"],
):
    """Tool description for the LLM"""
    # Your logic here
    return "Response to user"
```

**Change voice:**
- Browse voices at: https://docs.livekit.io/agents/models/tts/
- Update the `voice` parameter in `hospital_agent.py`

**Adjust instructions:**
- Modify the `instructions` parameter in `HospitalAssistant.__init__()`

## 🐛 Troubleshooting

**Agent not responding:**
- Check OpenAI API key in `.env.local`
- Verify LiveKit credentials
- Check logs for errors

**Poor audio quality:**
- Ensure good microphone
- Check network connection
- Adjust noise cancellation settings

**Context not working:**
- Check `patient_db.current_context` is being set
- Verify patient identifiers match

## 📚 Resources

- [LiveKit Agents Docs](https://docs.livekit.io/agents/)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Deepgram API Docs](https://developers.deepgram.com/)
- [Next.js Docs](https://nextjs.org/docs)

## 🎓 Learning Path

1. ✅ **Week 1:** Get voice agent working with mock data
2. **Week 2:** Set up PostgreSQL and integrate real database
3. **Week 3:** Build Next.js dashboard with patient list
4. **Week 4:** Add real-time updates and voice interface to dashboard
5. **Week 5:** Implement emergency alerts and notifications
6. **Week 6:** Add analytics and reporting
7. **Week 7:** Mobile app or advanced features
8. **Week 8:** Testing, security, and deployment

## 💡 Tips

- Start simple, iterate quickly
- Test with real medical staff for feedback
- Focus on reliability over features
- Keep voice responses concise
- Log everything for debugging
- Consider edge cases (network issues, unclear speech)

## 🚀 Deployment

**When ready for production:**

1. **Containerize:**
```dockerfile
# Dockerfile
FROM python:3.12
WORKDIR /app
COPY . .
RUN pip install uv
RUN uv sync
CMD ["uv", "run", "src/hospital_agent.py", "start"]
```

2. **Deploy to cloud:**
- AWS ECS / EC2
- Google Cloud Run
- Azure Container Instances
- Railway / Render

3. **Set up monitoring:**
- Application logs
- Error tracking (Sentry)
- Performance monitoring
- Uptime monitoring

---

## 🎉 You're Ready!

You now have a working hospital voice assistant. Start testing it, gather feedback, and iterate!

**Questions or issues?** Check the logs or refer to the LiveKit documentation.

**Next immediate step:** Try the voice commands listed above and see the agent in action!
