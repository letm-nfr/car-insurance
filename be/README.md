# Car Insurance Backend API

Node.js + Express backend for Car Insurance application with MongoDB.

## Setup

### Local Development (without Docker)

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with your configuration (see `.env` file)

3. Start MongoDB (must be running separately)

4. Start the server:
```bash
npm run dev
```

### Docker Setup

1. Make sure Docker is installed

2. Build and run with docker-compose:
```bash
docker-compose up --build
```

This will start both MongoDB and the Node.js server.

## API Endpoints

### Send OTP
- **POST** `/api/auth/send-otp`
- **Body**: `{ "email": "user@example.com" }`
- **Response**: `{ "message": "OTP sent successfully", "email": "user@example.com" }`

### Verify OTP
- **POST** `/api/auth/verify-otp`
- **Body**: `{ "email": "user@example.com", "otp": "123456" }`
- **Response**: `{ "message": "Login successful", "user": { ... } }`

## Environment Variables

- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `EMAIL_SERVICE`: Email service provider (gmail, yahoo, etc.)
- `EMAIL_USER`: Email address for sending OTPs
- `EMAIL_PASSWORD`: Email app password
- `OTP_EXPIRY`: OTP expiry time in milliseconds (default: 300000 = 5 minutes)

## Notes

- For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833)
- OTP is valid for 5 minutes by default
- Update `.env` file with your email credentials before running
