# ⚡ EV Charging Station Management System

![Project Banner](https://example.com/ev-banner.jpg) *(Add your image URL here)*

## 🌐 Live Deployment

* **Frontend URL**: [https://ev-charging-system-chi.vercel.app](https://ev-charging-system-chi.vercel.app)
* **Backend API**: [https://ev-charging-sys-backend.onrender.com](https://ev-charging-sys-backend.onrender.com)
* **API Documentation**: [Postman Collection](https://example.com/postman) | [Swagger UI](https://ev-backend.onrender.com/api-docs)

## 🛠 Technologies Used

| Component  | Technologies                        |
| ---------- | ----------------------------------- |
| Frontend   | React, Mapbox GL JS, Axios          |
| Backend    | Node.js, Express, MongoDB           |
| Security   | JWT, Helmet, Rate Limiting          |
| Deployment | Vercel (Frontend), Render (Backend) |

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
echo "REACT_APP_API_URL=http://localhost:5000
REACT_APP_MAPBOX_TOKEN=your_token" > .env
npm start
```

## 📌 Key Features

* User authentication (Login/Register)
* Interactive map with charging stations
* Admin dashboard for station management
* Mobile-responsive design
* Secure API endpoints with CORS protection

## 🔍 API Endpoints

| Method | Endpoint           | Description                  |
| ------ | ------------------ | ---------------------------- |
| POST   | /api/auth/login    | User login                   |
| GET    | /api/stations      | List all stations            |
| POST   | /api/stations      | Add new station (Admin only) |
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
REACT_APP_API_URL=https://your-backend.onrender.com
REACT_APP_MAPBOX_TOKEN=pk.your_mapbox_key
```

## 🗓 Development Timeline

| Day | Tasks Completed                  |
| --- | -------------------------------- |
| 1   | Backend CRUD APIs + JWT Auth     |
| 2   | Frontend auth + station list UI  |
| 3   | Map integration + API connection |
| 4   | Testing & deployment             |
| 5   | Documentation & final submission |

## 📂 Project Structure

```
/backend
  ├— models/       # MongoDB schemas
  ├— routes/       # API endpoints
  └— server.js     # Express server
/frontend
  ├— public/       # Static assets
  ├— src/
     ├— components # React components
     ├— pages/     # Application views
     └— App.js     # Main component
```

## 🛠 Troubleshooting

* **CORS Errors**: Verify `FRONTEND_URL` matches exactly in backend
* **Database Issues**: Check MongoDB Atlas IP whitelisting
* **Map Not Loading**: Validate Mapbox token in frontend `.env`
