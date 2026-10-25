<div align="center">

# 🛡️ Social Media Backend — Core Authentication & Security Engine
### *Assignment 15 — Robust RESTful Auth System with End-to-End Cryptography*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20%2F%20Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongoosejs.com/)
[![Zod](https://img.shields.io/badge/Validation-Zod-3068B7?style=for-the-badge&logo=zod&logoColor=white)](https://zod.dev/)
[![Security](https://img.shields.io/badge/Security-AES--256%20%7C%20Bcrypt%20%7C%20JWT-critical?style=for-the-badge&logo=auth0&logoColor=white)](#security-highlights)

<p align="center">
A production-ready authentication and authorization microservice built with <b>Express 5</b> and <b>TypeScript</b>, establishing the foundational security, cryptography, and email verification architecture for a modern social media platform.
</p>

---

</div>

## 📌 Architectural Overview

Assignment 15 serves as the secure backbone of the application. It establishes robust user identity lifecycles, event-driven OTP generation, multi-layered data encryption, and defensive API rate limiting to safeguard against brute-force and tampering vectors.

```
┌─────────────────────────────────────────────────────────────┐
│                       Incoming Request                      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                ┌──────────────▼──────────────┐
                │   Helmet Security Headers   │
                └──────────────┬──────────────┘
                               │
                ┌──────────────▼──────────────┐
                │   Rate Limiting (50/15min)  │
                └──────────────┬──────────────┘
                               │
                ┌──────────────▼──────────────┐
                │      CORS Protection        │
                └──────────────┬──────────────┘
                               │
                ┌──────────────▼──────────────┐
                │    Zod Validation Layer     │
                └──────────────┬──────────────┘
                               │
                ┌──────────────▼──────────────┐
                │  Authentication Controller  │
                └──────────────┬──────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ Encryption/Hash │   │ Event-Based OTP │   │ Mongoose Schema │
│ (CryptoJS/Bcrypt│   │  (Nodemailer)   │   │  (MongoDB Atlas)│
└─────────────────┘   └─────────────────┘   └─────────────────┘
```

---

## ⚡ Core Capabilities

- **🔐 Dual Token Lifecycle**: Granular session management using signed JWT access and refresh tokens.
- **🔒 Sensitive Field Cryptography**: AES-256 reversible encryption for sensitive user information (e.g. phone numbers) paired with unidirectional Bcrypt hashing for credentials.
- **✉️ Asynchronous OTP & Email Verification**: Decoupled Node.js `EventEmitter` pipeline dispatching HTML templates via Nodemailer.
- **🌐 Google OAuth Integration**: Authenticate users seamlessly using Google Identity Services and `google-auth-library`.
- **🛡️ Defensive Middleware**: Strict CORS policies, rate limiting protection (50 req / 15 min), and Helmet HTTP protection.
- **✅ Strict Type Validation**: Runtime schema parsing powered by Zod ensuring type safety across headers, query, params, and payloads.
- **🚨 Unified Error Management**: Standardized custom error hierarchies (`NotFoundException`, `ConflictException`, etc.) intercepted by a global handler.

---

## 🛣️ API Endpoints Directory

Base URL: `/api/v1/auth`

| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :---: |
| `POST` | `/signup` | Register new user account & dispatch email verification OTP | No |
| `PATCH` | `/confirm-email` | Validate OTP code to confirm email address | No |
| `POST` | `/login` | Authenticate credentials & return JWT tokens | No |
| `POST` | `/google-login` | Sign-in / sign-up via Google OAuth ID token | No |
| `POST` | `/forget-password`| Request password reset code sent to registered inbox | No |
| `PATCH` | `/reset-password` | Set new password using verified OTP code | No |
| `POST` | `/logout` | Invalidate current session and revoke authorization | **Yes (Bearer)** |

> 🔗 **Postman Collection**: [Interactive API Workspace & Documentation](https://interstellar-astronaut-704203.postman.co/workspace/projects~ae710d90-1f14-46fe-a804-27e07553be8f/request/26698971-1bc9c4a7-7030-49a6-8acb-bf1a90d99849?action=share&creator=26698971)

---

## 🛠️ Tech Stack & Dependencies

- **Runtime & Language**: Node.js, TypeScript
- **Web Framework**: Express v5
- **Database Layer**: MongoDB, Mongoose v9
- **Validation**: Zod v4
- **Security & Crypto**: Bcrypt, JsonWebToken, Helmet, Express-Rate-Limit, Google Auth Library
- **Mailing**: Nodemailer

---

## 🚀 Getting Started

### 1. Installation
```bash
# Navigate to the assignment folder
cd Assignment-15

# Install dependencies
npm install
```

### 2. Environment Variables
Create a file named `config/dev.env` with the following keys:
```env
PORT=3000
APPLICATION_NAME=SocialMediaApp
DB_URI=mongodb://localhost:27017/social_media_app
JWT_SECRET=your_jwt_secret_key
SALT_ROUNDS=10
ENCRYPTION_KEY=your_aes_encryption_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
GOOGLE_CLIENT_ID=your_google_client_id
```

### 3. Running the Server
```bash
# Start development mode with TypeScript compiler and hot reload
npm run dev
```

---

<div align="center">

### 👨‍💻 Author

<br/>

**Jason Hany**  
*Backend Engineer & TypeScript Architect*

[![GitHub](https://img.shields.io/badge/GitHub-Profile-181717?style=flat-square&logo=github)](https://github.com/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/)

<sub>Engineered with precision for high security, scalability, and code excellence.</sub>

</div>
