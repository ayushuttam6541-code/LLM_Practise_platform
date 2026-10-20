# LLM Practice Platform

A full-stack platform for practicing low-level design (LLD) interviews with automated evaluation. The app lets users browse problems, attempt solutions, submit answers, and receive feedback from a rule-based or AI-based evaluator.

## Overview

This project is split into two main parts:

- Frontend: React + TypeScript + Vite client for the user interface
- Backend: Express + TypeScript API with evaluation logic and persistent storage

The platform is designed to support:

- Problem exploration and selection
- Coding attempts per problem
- Submission validation
- State-based attempt lifecycle
- Rule-based evaluator and optional Gemini AI evaluation
- Lightweight database-backed persistence

## Features

- Browse available design problems
- Open problem details and solution context
- Create and track coding attempts
- Submit attempt solutions for evaluation
- Review evaluation results and feedback
- Switch between mock/rule-based and AI evaluator modes
- Serve frontend and API from the same app in production

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- CSS modules / custom styling
- Lucide React icons

### Backend
- Node.js
- Express
- TypeScript
- SQLite-like local DB via file-based storage
- Optional Google Gemini AI integration

## Repository Structure

```text
LLM_Practise_platform/
├── client/                  # React frontend
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── README.md
├── server/                  # Express backend
│   ├── data/
│   ├── src/
│   ├── tests/
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── package.json            # Root scripts
├── package-lock.json
└── README.md               # Project README
```

## Project Flow

1. User opens the app in the browser.
2. Frontend loads problem list and attempt pages.
3. User selects a problem and starts an attempt.
4. Backend stores the attempt state and submission payload.
5. Evaluator validates and scores the attempt.
6. Results are returned to the UI for review.

## Prerequisites

- Node.js 18+
- npm
- Optional: Google Gemini API key for AI evaluation mode

## Installation

From the project root:

```bash
npm install
npm run install:all
```

This installs dependencies for the root workspace, backend, and frontend.

## Run the Application

### Start backend only

```bash
npm run dev
```

This runs the server in development mode.

### Build both apps

```bash
npm run build
```

### Run tests

```bash
npm run test
```

## Environment Variables

The backend reads configuration from environment variables using `dotenv`.

Create a `.env` file inside the `server` directory (or set them in your environment) with values like:

```env
PORT=4000
EVALUATOR_MODE=mock
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash
CORS_ORIGIN=*
```

Notes:

- `EVALUATOR_MODE` can be `mock` or `ai`
- If `GEMINI_API_KEY` is not set, the app can still run in mock/rule-based mode

## Available Scripts

From the root:

```bash
npm run install:all
npm run seed
npm run build
npm run start
npm run dev
npm run test
```

From `server/`:

```bash
npm run dev
npm run build
npm run start
npm run seed
npm run test
```

From `client/`:

```bash
npm run dev
npm run build
npm run preview
```

## Notes

This repository is intended as a practice platform for LLD interview preparation and automated rubric-based evaluation. It combines a lightweight API backend with a modern React frontend to simulate a polished interview training experience.

## License

This project does not appear to include a license file in the repository yet. If you want, you can add an open-source license such as MIT or Apache 2.0.

## Contributing

Contributions are welcome. You can:

- improve evaluation logic
- add new problem sets
- enhance the frontend UX
- improve tests and documentation

---

If you want, I can also add a more polished project-specific README tailored to the exact UI and backend features in this repo, or create a root-level `.env.example` file for setup.
