# AI Tutor API Integration Setup

This document explains how to set up and use the AI Tutor API integration in the SheRockets application.

## Environment Configuration

1. Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your API endpoint:

   ```env
   # For local development
   NEXT_PUBLIC_AI_TUTOR_API_URL=http://localhost:8080

   # For production
   # NEXT_PUBLIC_AI_TUTOR_API_URL=https://your-api-domain.com
   ```

## API Endpoint

The AI Tutor expects a POST request to `/api/sherockets-tutor` with the following payload structure:

### Request Payload

```json
{
  "inputText": "Your question here",
  "conversation": [
    { "isUser": true, "text": "Previous question" },
    { "isUser": false, "text": "Previous AI response" }
  ],
  "subject": "Space Science",
  "difficulty": "beginner",
  "language": "en",
  "userId": "unique_user_id"
}
```

### Response Format

```json
{
  "response": "AI tutor's response",
  "subject": "Space Science",
  "difficulty": "beginner",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "conversationId": "unique_conversation_id"
}
```

## Testing the Integration

1. Start your AI tutor API server on `http://localhost:8080`

2. Run the test script:

   ```bash
   node test-ai-tutor-api.js
   ```

3. Or test directly in the application by:
   - Opening the SheRockets app
   - Clicking on the AI tutor (Dr. Luna) icon
   - Asking a question

## Fallback Behavior

If the API is unavailable or returns an error, the AI tutor will:

- Log the error to the console
- Display a fallback message to the user
- Use the built-in mock responses as a backup

## Implementation Details

The AI Tutor component (`src/app/components/AITutor.tsx`) has been updated to:

- Make HTTP requests to the configured API endpoint
- Handle conversation history properly
- Manage conversation IDs for session continuity
- Provide graceful error handling with fallback responses
- Generate unique user IDs for each session

## Development Notes

- The component uses `NEXT_PUBLIC_AI_TUTOR_API_URL` environment variable
- Default fallback URL is `http://localhost:8080`
- All API calls are made from the client-side (browser)
- Error handling includes network errors and API response errors
- Conversation history is maintained throughout the session
