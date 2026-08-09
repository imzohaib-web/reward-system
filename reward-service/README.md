# Reward Service

Microservice for calculating and managing rewards in the Reward System ecosystem.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   Copy `.env.example` to `.env` and update values.

3. Start MongoDB (ensure MongoDB is running on localhost:27017)

4. Run the service:
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## API Endpoints

- `GET /health` - Health check

## Testing

```bash
npm test
```

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Mongoose models
├── routes/         # Route definitions
├── services/       # Business logic
├── utils/          # Utility functions
├── validators/     # Input validation
├── app.js          # Express app setup
└── server.js       # Entry point
```