# Gemini AI API Project

A simple Express.js API server that integrates with Google's Gemini AI for chat functionality and file analysis.

## Features

- **Chat Endpoint**: Send messages and get AI responses from Gemini
- **File Upload & Analysis**: Upload and analyze multiple file types (images, videos, audio, text) using AI
- **CORS Support**: Ready for frontend integration
- **Environment Variables**: Secure API key management

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
4. Start the server:
   ```bash
   node index.js
   ```

## API Endpoints

### POST /chat

Send a message to the AI and get a response.

**Request Body:**

```json
{
  "message": "Hello, how are you?"
}
```

**Response:**

```json
{
  "response": "I'm doing well, thank you for asking!"
}
```

### POST /upload-describe

Upload one or multiple files and get AI analysis of their content.

**Content-Type:** `multipart/form-data`

**Form Data:**

- Files to upload (supports images, videos, audio, and text files)

**Response:**

```json
{
  "results": [
    {
      "file": "example.jpg",
      "description": "This image shows..."
    },
    {
      "file": "document.txt",
      "description": "This text file contains..."
    }
  ]
}
```

## Environment Variables

- `GEMINI_API_KEY`: Your Google Gemini API key
- `PORT`: Server port (default: 3000)

## Usage

The server runs on `http://localhost:3000` by default. You can test the endpoints using tools like Postman, curl, or integrate with a frontend application.

## Requirements

- Node.js v18+
- Google Gemini API key

## Dependencies

- express
- cors
- dotenv
- multer
- @google/genai
