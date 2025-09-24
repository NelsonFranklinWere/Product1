# BOLT SME - Full Stack Application

A comprehensive SME (Small and Medium Enterprise) management platform with unified social media management and AI-powered automation.

## Project Structure

```
BOLT_SME/
├── frontend/          # React + Vite + TypeScript frontend
│   ├── src/
│   ├── package.json
│   └── ...
├── backend/           # Node.js + Express backend
│   ├── src/
│   ├── package.json
│   └── ...
└── README.md
```

## Quick Start

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: http://localhost:5174/

### Backend (Node.js + Express)
```bash
cd backend
npm install
npm run dev
```
Backend runs on: http://localhost:3001/

## Features

### Frontend
- ✅ React + TypeScript + Vite
- ✅ Tailwind CSS for styling
- ✅ Local authentication (localStorage)
- ✅ Content calendar and scheduling
- ✅ Social media management
- ✅ Analytics dashboard
- ✅ Message center
- ✅ No external dependencies (Supabase removed)

### Backend
- ✅ Express.js API server
- ✅ CORS enabled
- ✅ Health check endpoint
- ✅ Ready for database integration
- 🔄 API endpoints (in development)

## Development

1. **Start Frontend**: `cd frontend && npm run dev`
2. **Start Backend**: `cd backend && npm run dev`
3. **Access**: Frontend at http://localhost:5174/

## Tech Stack

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (icons)

**Backend:**
- Node.js
- Express.js
- CORS
- dotenv

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/posts` - Posts management
- `POST /api/posts` - Create posts
- `GET /api/messages` - Messages
- `GET /api/social-accounts` - Social accounts

## Notes

- Frontend uses localStorage for data persistence
- No external database required for development
- Backend ready for database integration
- All Supabase dependencies removed"# Product1" 
