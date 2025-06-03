# ⚡ EV Charging Station Management System

## 🚀 Overview

This is a full-stack application built with Node.js, Express, and Vue.js to manage EV Charging Stations. It includes REST APIs for CRUD operations, user authentication using JWT, a map view for station visualization, and cloud deployment.

## 🌐 Live Deployment

* **Frontend URL**: [https://ev-charging-system-chi.vercel.app](https://ev-charging-system-chi.vercel.app)
* **Backend API**: [https://ev-charging-sys-backend.onrender.com](https://ev-charging-sys-backend.onrender.com)
* **API Documentation**: [Postman Collection](https://example.com/postman) | [Swagger UI](https://ev-backend.onrender.com/api-docs)

## 🛠 Technologies Used

| Component  | Technologies                        |
| ---------- | ----------------------------------- |
| Frontend   | Vue.js, Axios, Google Maps API      |
| Backend    | Node.js, Express, MongoDB           |
| Security   | JWT, Helmet, Rate Limiting          |
| Deployment | Vercel (Frontend), Render (Backend) |

## ✅ Features

* User authentication (Login/Register)
* JWT-protected routes for station management
* CRUD operations for charging stations
* Station attributes: Name, Latitude, Longitude, Status, Power Output, Connector Type
* Filter chargers by status, power output, and connector type
* Google Maps integration to visualize station locations
* Mobile responsive and user-friendly UI

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
echo "MONGODB_URI=mongodb+srv://user:pass@cluster.xxx.mongodb.net/ev-charging
JWT_SECRET=your_secret
FRONTEND_URL=http://localhost:3000" > .env
npm start
```

### 2. Frontend Setup

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:5000
VITE_GOOGLE_MAPS_KEY=your_key" > .env
npm run dev
```

## 🔍 API Endpoints

| Method | Endpoint           | Description                  |
| ------ | ------------------ | ---------------------------- |
| POST   | /api/auth/signup   | Register new user            |
| POST   | /api/auth/login    | User login (JWT Token)       |
| GET    | /api/stations      | List all stations            |
| POST   | /api/stations      | Add new station (Protected)  |
| PUT    | /api/stations/\:id | Update a station (Protected) |
| DELETE | /api/stations/\:id | Delete a station (Protected) |
| GET    | /api/stations/\:id | Get station details          |

## ⚙ Deployment Configuration

### Backend (Render)

**Runtime**: Node 18

**Environment Variables:**

```env
PORT=5000
MONGODB_URI=your_mongo_uri
JWT_SECRET=complex_secret_here
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend (Vercel)

**Build Command**: `npm run build`

**Environment Variables:**

```env
VITE_API_URL=https://your-backend.onrender.com
VITE_GOOGLE_MAPS_KEY=your_google_maps_key
```

## 📂 Project Structure

```
/backend
  ├— models/       # MongoDB schemas
  ├— routes/       # API endpoints
  └— server.js     # Express server
/frontend
  ├— public/       # Static assets
  ├— src/
     ├— components # Vue components
     ├— views/     # Application views
     └— main.js    # App entry point
```