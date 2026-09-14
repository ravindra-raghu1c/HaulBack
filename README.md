# 🚛 HaulBack — AI Return-Load Freight & Telemetry Platform

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini_AI-2.4-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

> A full-stack logistics platform designed to solve the **"deadhead miles"** problem in freight transportation. HaulBack connects truck drivers with return loads, features live bidding, real-time GPS telemetry on interactive maps, and AI-driven dispatch optimization.

---

## 📌 Table of Contents

- [The Problem & The Solution](#-the-problem--the-solution)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the App](#running-the-app)
- [API Endpoints](#-api-endpoints)
- [Screenshots & UI Highlights](#-screenshots--ui-highlights)
- [Future Enhancements](#-future-enhancements)
- [Author](#-author)
- [License](#-license)

---

## 💡 The Problem & The Solution

### The Problem
In commercial road freight, up to **40% of truck journeys return completely empty** (known as *deadheading*). This causes:
- 💸 Massive fuel and operating revenue loss for truck owners and drivers.
- 🌫️ Unnecessary carbon emissions from empty vehicles.
- 📦 Supply chain delays and high freight costs for shippers.

### The Solution
**HaulBack** creates an intelligent two-sided freight marketplace:
1. **Empty Return Matching:** Instantly matches trucks near delivery hubs with nearby backhaul loads along national corridors (e.g., NH44, NH48).
2. **Live Bidding Arena:** Enables dynamic spot price negotiation between shippers and carriers.
3. **AI Route Optimization:** Leverages Google Gemini AI to analyze route efficiency, estimate fuel savings, and recommend high-profit cargo.
4. **Live Telemetry:** Tracks vehicle transit, speed, waypoint progress, and deadhead km saved in real-time.

---

## ✨ Key Features

### 👨‍✈️ Driver & Carrier Dashboard
- **Radar Feed:** Real-time stream of nearby return loads tailored to truck capacity and return destination.
- **One-Click Bidding:** Submit and track quotes with automated margin calculations.
- **Trip Telemetry Simulator:** Track active loads with live GPS coordinates, speed, ETA, and fuel status.

### 🏭 Shipper & Transporter Portal
- **Load Posting:** Post new consignments with cargo dimensions, pickup/drop coordinates, and target pricing.
- **Live Bid Evaluation:** Review driver bids, ratings, vehicle VAHAN checks, and lock contracts atomically.
- **Status Tracking:** Monitor transit milestones from pickup to destination unloading.

### 📊 Fleet Manager Analytics
- **Corridor Efficiency:** Visualize fleet metrics across major transit corridors.
- **Deadhead Savings Tracker:** Real-time analytics on total fuel cost saved and carbon offsets.

### 🤖 Gemini AI Logistics Assistant
- **Automated Dispatch Analysis:** Generates route profit projections and turnaround time estimations.
- **Corridor Risk Assessment:** Evaluates weather, toll bottlenecks, and highway congestion.

### 🗺️ Interactive Maps & Sound FX
- **Leaflet Route Visualization:** Dynamic polyline routing and interactive animated markers.
- **Audio Feedback:** Subtle radar pings and sound effects for critical updates and bid confirmations.
- **Atmospheric Highway Backdrop:** 3D highway perspective with day, sunset, and night themes.

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite |
| **Styling & UI** | Tailwind CSS 4, Lucide React Icons, Canvas Confetti |
| **State Management** | Redux Toolkit (`@reduxjs/toolkit`, `react-redux`) |
| **Maps & Geospatial** | Leaflet, React Leaflet |
| **Backend & API** | Node.js, Express.js |
| **Artificial Intelligence** | Google Gemini API (`@google/genai`) |
| **Animation** | Motion (`motion/react`) |
| **Data Fetching** | Axios, REST APIs |

---

## 📂 Project Architecture

```plaintext
haulback/
├── src/
│   ├── components/
│   │   ├── backdrop/         # 3D Highway dynamic background
│   │   ├── bidding/          # Spot bidding room and modal
│   │   ├── common/           # Navigation, modals, notifications, auth
│   │   ├── dashboard/        # Role-based dashboards (Driver, Shipper, Fleet)
│   │   ├── dispatch/         # Gemini AI dispatch optimizer modal
│   │   ├── hero/             # Interactive hero section
│   │   ├── loads/            # Load cards, details, and posting form
│   │   └── telemetry/        # GPS tracking & waypoint progress components
│   ├── server/
│   │   ├── apiRouter.js      # REST API router & in-memory database
│   │   ├── geminiDispatcher.js # Google Gemini AI integration
│   │   └── mockDb.js         # Initial freight corridors and seed loads
│   ├── services/
│   │   ├── api.js            # Axios client helpers
│   │   └── soundFx.js        # Web Audio API audio synthesizer
│   ├── store/                # Redux Toolkit store and slices
│   ├── App.tsx               # Root application coordinator
│   ├── index.css             # Tailwind CSS styles
│   └── main.tsx              # Application mount point
├── server.ts                 # Express production server
├── vite.config.ts            # Vite configuration
├── package.json              # Project dependencies & scripts
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started

Follow these simple steps to get a local copy up and running on your machine.

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 18.0 or higher)
- `npm` or `yarn` / `bun`
- A Google Gemini API key (optional for basic UI, recommended for AI dispatch features)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/haulback.git
   cd haulback
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Add your credentials to `.env`:

```env
# Optional: Required to enable Gemini AI dispatch recommendations
GEMINI_API_KEY="your_google_gemini_api_key_here"

# Port (Defaults to 3000)
PORT=3000
```

> 💡 *You can obtain a free Gemini API key from [Google AI Studio](https://aistudio.google.com/).*

### Running the App

#### Development Mode (Frontend + Backend)
To start the Vite development server:
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:3000
```

#### Production Build
To create an optimized production build and start the Express server:
```bash
npm run build
npm start
```

---

## 🔌 API Endpoints

The application includes built-in Express REST APIs:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/loads` | Fetch all available return-load freight listings |
| `POST` | `/api/loads` | Post a new cargo consignment |
| `GET` | `/api/bids` | Retrieve active bids for loads |
| `POST` | `/api/bids` | Submit a competitive bid for a return load |
| `GET` | `/api/telemetry` | Get simulated vehicle GPS coordinates and route status |
| `POST` | `/api/ai/optimize-dispatch` | Trigger Gemini AI dispatch route analysis |

---

## 🔮 Future Enhancements

- [ ] **Real FASTag & VAHAN Integration:** Live toll and vehicle registration verification via official government APIs.
- [ ] **Push Notifications:** Instant WhatsApp & SMS load alerts for truck drivers on highway routes.
- [ ] **Offline PWA Support:** Offline load viewing for drivers in low-connectivity rural corridors.
- [ ] **Automated Invoicing:** Auto-generation of GST e-way bills upon completed trip verification.

---

## 👨‍💻 Author

**Ravindra Raghuwanshi & Shiv Raghuwanshi **
- 📧 Email: [ravindraraghuwanshi487@gmail.com](mailto:ravindraraghuwanshi487@gmail.com) | [shivraghuwanshi775@gmil.com](mailto:shivraghuwanshi775@gmail.com)
- 💼 LinkedIn: [Ravindra](https://www.linkedin.com/in/ravindra-raghuwanshi-3a7150289/) | [Shiv](https://www.linkedin.com/in/shiv-raghuwanshi-246237305/)
- 🐙 GitHub: [Ravindra](https://www.github.com/ravindra-raghu1c) | [shiv](https://github.com/shiv-raghu775)

*Feel free to connect or open an issue if you have suggestions or questions!*

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — free to use for educational and personal projects.

---

<p align="center">
  Made with ❤️ to optimize freight logistics and eliminate deadhead miles.
</p>
