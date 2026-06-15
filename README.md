# 💊 VoiceRx — Your Prescription, In Your Language

<p align="center">
  <strong>AI-powered prescription scanner that reads medicine instructions aloud in Indian languages</strong>
</p>

---

## ✨ Features

- 📸 **Prescription Scanner** — Photograph your prescription and extract medicines using Google Gemini AI
- 🗣️ **Voice Instructions** — Hear medicine dosage and schedule in Hindi, Marathi, Bengali, Tamil, or Telugu
- 📅 **Smart Schedule** — View medicines organized by time (Morning, Afternoon, Evening, Night)
- 💬 **AI Chat** — Ask questions about your prescription and get instant, context-aware answers
- 📱 **SMS Reminders** — Receive timely Twilio SMS reminders for each medication timing
- 🔥 **Firebase Persistence** — Prescription data stored securely in Firestore

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, Tailwind CSS |
| AI/ML | Google Gemini 1.5 Flash & Pro |
| Voice | Google Cloud Text-to-Speech |
| SMS | Twilio |
| Database | Firebase Firestore |
| Icons | Lucide React |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm
- Google Cloud account (for Gemini API & TTS)
- Twilio account (for SMS)
- Firebase project (for Firestore)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd voicerx

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_TTS_API_KEY=your_google_tts_api_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
voicerx/
├── app/
│   ├── page.jsx              # Upload screen
│   ├── schedule/page.jsx     # Medication schedule
│   ├── chat/page.jsx         # AI chat assistant
│   ├── layout.jsx            # Root layout + navigation
│   └── globals.css           # Design system & styles
├── components/
│   ├── UploadBox.jsx         # Drag/drop image upload
│   ├── MedicineCard.jsx      # Medicine info + play button
│   ├── ScheduleGrid.jsx      # Time-grouped medicine grid
│   ├── ChatBubble.jsx        # Chat message bubble
│   ├── LanguageSelector.jsx  # Language dropdown
│   └── ReminderSetup.jsx     # SMS reminder form
├── lib/
│   ├── gemini.js             # Gemini AI client
│   ├── tts.js                # TTS utility functions
│   ├── twilio.js             # Twilio SMS client
│   └── firebase.js           # Firebase/Firestore init
└── pages/api/
    ├── scan.js               # OCR prescription scan
    ├── parse.js              # Medicine extraction
    ├── tts.js                # Text-to-speech
    ├── chat.js               # AI Q&A
    └── remind.js             # SMS reminders
```

---

## 🌐 Supported Languages

| Language | Code |
|----------|------|
| 🇮🇳 Hindi | `hi-IN` |
| 🇮🇳 Marathi | `mr-IN` |
| 🇧🇩 Bengali | `bn-IN` |
| 🇮🇳 Tamil | `ta-IN` |
| 🇮🇳 Telugu | `te-IN` |

---

## 📱 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/scan` | POST | Extract text from prescription image (multipart/form-data) |
| `/api/parse` | POST | Parse medicines from raw text to structured JSON |
| `/api/tts` | POST | Convert text to speech in selected language |
| `/api/chat` | POST | Ask questions about prescribed medicines |
| `/api/remind` | POST | Send SMS reminders via Twilio |

---

## 🚀 Deployment

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

---

## 📋 License

MIT License — built with ❤️ for accessible healthcare.
