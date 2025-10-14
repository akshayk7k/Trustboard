**Trustboard**

Trustboar is a secure, anonymous feedback and platform for organizations, startups, and educational institutions.  
It enables users to safely submit feedback while providing administrators with AI-powered moderation (via **Google Gemini API**), email alerts, and an admin dashboard to manage submissions efficiently.

---

## Project Structure

trustboard/
├── backend/ # Node.js (Express, MongoDB) REST API
├── frontend/ # React (Vite + TailwindCSS) web client
└── README.md # This documentation

## Features

### Core Features
- Anonymous feedback submission
- Tagging and categorization
- Comment threads and discussions
- Admin dashboard with secure JWT login
- **AI-powered moderation** using Google Gemini API
- Email notifications for new or flagged feedback
- Responsive and modern UI built with TailwindCSS

### Security Features
- JWT access and refresh token system
- Password hashing with bcrypt
- CORS and rate limiting protection
- Environment-based configuration for secrets
- AI moderation to prevent abusive or harmful content

---


## Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React, Vite, TailwindCSS, Axios, React Router |
| **Backend** | Node.js, Express, MongoDB, Mongoose |
| **AI Moderation** | Google Gemini API |
| **Email** | Nodemailer (SMTP) |
| **Authentication** | JWT (Access & Refresh Tokens) |
| **Environment Management** | dotenv, cookie-parser |

---


## Setup Guide

1️⃣ Clone the Repository

```bash

git clone https://github.com/yourusername/trustboard.git
cd trustboard

2️⃣ Backend Setup
cd backend
npm install

Create a .env file in /backend:

MONGO_URI=mongodb+srv://<USERNAME>:<PASSWORD>@cluster.mongodb.net/
PORT=5000
FRONTEND_URL=http://localhost:5173

JWT_SECRET=<your_jwt_secret>
JWT_REFRESH_SECRET=<your_refresh_secret>

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your_app_password
ADMIN_EMAIL=youremail@gmail.com

# Google Gemini AI Moderation API
GEMINI_API_KEY=your_gemini_api_key


Start the backend server:
npm start
Backend will run on http://localhost:5000

3️⃣ Frontend Setup
cd ../frontend
npm install

Create a .env file in /frontend:
VITE_API_URL=http://localhost:5000

Run the frontend:
npm run dev
Frontend will run on http://localhost:5173

AI Moderation Flow (Google Gemini API)

User submits feedback
      ↓
Rule-based local moderation
      ↓
Gemini AI moderation → gemini-2.5-flash model
      ↓
If flagged → mark as toxic + email admin
Else → store in MongoDB


Email Notification Flow

Feedback submitted
      ↓
Backend stores it → triggers sendEmail()
      ↓
Nodemailer sends alert to ADMIN_EMAIL
      ↓
Admin reviews flagged feedback in dashboard

API Endpoints Summary

| Method | Endpoint                  | Description                         |
| ------ | ------------------------- | ----------------------------------- |
| POST   | /api/auth/register        | Register new user                   |
| POST   | /api/auth/login           | Login and get token                 |
| GET    | /api/auth/me              | Get current user info               |
| POST   | /api/feedback             | Submit feedback                     |
| GET    | /api/feedback             | Get all feedback                    |
| GET    | /api/feedback/:id         | Get specific feedback with comments |
| DELETE | /api/feedback/:id         | Delete feedback (admin only)        |
| POST   | /api/comments/:feedbackId | Add comment                         |
| GET    | /api/comments/:feedbackId | Get comments for feedback           |
| POST   | /api/admin/init           | Create first admin                  |
| POST   | /api/admin/login          | Admin login                         |
| POST   | /api/admin/logout         | Logout admin                        |


Database Schema Overview

| Collection | Fields                                       | Description             |
| ---------- | -------------------------------------------- | ----------------------- |
| users      | username, email, passwordHash                | Registered users/admins |
| feedbacks  | text, tags, author, moderated, flaggedReason | Main feedback records   |
| comments   | feedbackId, text, author, createdAt          | Comments on feedback    |


Frontend Overview

| Page             | Description                          |
| ---------------- | ------------------------------------ |
| /                | Home – list of feedback              |
| /submit          | Submit new feedback                  |
| /login           | Login page                           |
| /admin/dashboard | Admin dashboard for flagged feedback |


System Architecture Diagram

+-------------------+       +------------------+
|  React Frontend   | <---> |  Express Backend |
|  (Vite + Axios)   |       |  (Node.js + JWT) |
+-------------------+       +---------+--------+
                                   |
                                   v
                           +---------------+
                           |   MongoDB     |
                           +---------------+
                                   |
                                   v
                         +------------------------+
                         | Google Gemini AI (API) |
                         +------------------------+
                                   |
                                   v
                         +------------------+
                         | Email (SMTP)     |
                         | Nodemailer Alert  |
                         +------------------+

Security Notes

Passwords hashed using bcrypt

JWT used for stateless authentication

HTTP-only cookies for refresh tokens

AI moderation prevents toxic/spam content

Rate limiting to prevent brute-force attacks

CORS restricted to trusted frontend origins

