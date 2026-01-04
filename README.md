# Napa Valley Wineries (NVW) Platform

A modern, high-performance platform for booking and exploring Napa Valley winery experiences.

## Features

- **Conversational AI Concierge**: Natural language search and detailed itinerary planning.
- **Infinite Scroll**: Optimized winery listing with lazy loading and intersection observation.
- **Optimized API**: Paginated `GET /api/winery` endpoints for reduced payload size and faster load times.
- **Secure Booking**: Integrated with Resend for transactional emails and Twilio for SMS.
- **Role-Based Access**: Specialized dashboards for Customers, Winery Owners, and Admins.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## API Documentation

### Winery Endpoints

#### `GET /api/winery`
Fetches a list of wineries.
- **Pagination**: `?page=1&limit=20` (Default limit: 20)
- **Response**: `{ wineries: Winery[], total: number, page: number, pages: number }`
- **Optimization**: Returns a lean object subset for card views to improve performance.

## Deployment

The project is optimized for deployment on Vercel.
- **Build**: `npm run build` (Minification enabled, strict mode active)
- **Environment**: Ensure `MONGODB_URI`, `RESEND_API_KEY`, and `NEXT_PUBLIC_APP_URL` are set.
 
