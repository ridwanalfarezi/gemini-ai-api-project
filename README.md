# 🤖 Gemini AI Assistant

A full-stack web application that integrates with Google's Gemini AI for intelligent chat conversations and file analysis. Features a modern web interface with conversation history, file upload capabilities, and real-time markdown rendering.

![Gemini AI Assistant](https://img.shields.io/badge/AI-Gemini%202.5-blue) ![Node.js](https://img.shields.io/badge/Node.js-v18+-green) ![Express](https://img.shields.io/badge/Express-v5.1-lightgrey)

## ✨ Features

### 🗣️ **Intelligent Chat System**

- **Conversation Memory**: Maintains context throughout the entire chat session
- **Real-time Responses**: Instant AI responses with typing indicators
- **Markdown Support**: Rich text formatting with code blocks, lists, and headers
- **Session Management**: Unique session IDs for conversation tracking

### 📁 **Advanced File Analysis**

- **Multi-file Upload**: Upload multiple files simultaneously
- **Comprehensive Support**: Images, videos, audio, text documents, and PDFs
- **Context-Aware Analysis**: File analysis integrated with conversation history
- **Custom Instructions**: Add specific instructions for file analysis

### 🎨 **Modern Web Interface**

- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dynamic Chat Bubbles**: Auto-sizing bubbles based on message content
- **File Preview**: Visual preview of uploaded files with metadata
- **Loading Animations**: Smooth typing indicators and spinners
- **Clear Chat**: Reset conversation history with one click

### 🔧 **Technical Features**

- **RESTful API**: Clean `/api/` endpoint structure
- **CORS Support**: Ready for cross-origin requests
- **Environment Variables**: Secure API key management
- **Error Handling**: Comprehensive error responses
- **File Type Detection**: Automatic MIME type handling

## 🚀 Quick Start

### Prerequisites

- Node.js v18 or higher
- Google Gemini API key ([Get it here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ai-integration
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Gemini API key:

   ```env
   GEMINI_API_KEY=your_api_key_here
   PORT=3000
   ```

4. **Start the server**

   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📡 API Endpoints

### `POST /api/chat`

Send a text message with conversation history.

**Request:**

```json
{
  "message": "Explain quantum computing",
  "sessionId": "session_12345"
}
```

**Response:**

```json
{
  "reply": "Quantum computing is a revolutionary computing paradigm...",
  "sessionId": "session_12345"
}
```

### `POST /api/upload`

Upload and analyze files with conversation context.

**Content-Type:** `multipart/form-data`

**Form Data:**

- `files`: File(s) to upload
- `instruction`: Custom analysis instruction (optional)
- `sessionId`: Session identifier for context

**Response:**

```json
{
  "results": [
    {
      "file": "diagram.png",
      "description": "This image shows a network architecture diagram..."
    }
  ],
  "sessionId": "session_12345"
}
```

### `POST /api/clear-chat`

Clear conversation history for a session.

**Request:**

```json
{
  "sessionId": "session_12345"
}
```

**Response:**

```json
{
  "message": "Chat history cleared",
  "sessionId": "session_12345"
}
```

## 🗂️ Project Structure

```
ai-integration/
├── 📄 index.js              # Express server with API routes
├── 📄 package.json          # Project dependencies and scripts
├── 📁 public/               # Frontend assets
│   ├── 📄 index.html        # Main web interface
│   ├── 📄 script.js         # Frontend JavaScript logic
│   └── 📄 style.css         # Responsive CSS styling
├── 📄 .env                  # Environment variables (not in repo)
├── 📄 .env.example          # Environment template
├── 📄 .gitignore            # Git ignore rules
└── 📄 README.md             # This file
```

## 🎯 Supported File Types

| Category      | Extensions                       | AI Model         |
| ------------- | -------------------------------- | ---------------- |
| **Images**    | `.jpg`, `.jpeg`, `.png`, `.webp` | Gemini 2.5 Flash |
| **Videos**    | `.mp4`, `.mov`, `.webm`          | Gemini 2.0 Flash |
| **Audio**     | `.mp3`, `.wav`, `.ogg`, `.m4a`   | Gemini 2.5 Flash |
| **Documents** | `.txt`, `.pdf`, `.doc`, `.docx`  | Gemini 2.5 Flash |

## 🔧 Configuration

### Environment Variables

| Variable         | Description           | Default      |
| ---------------- | --------------------- | ------------ |
| `GEMINI_API_KEY` | Google Gemini API key | **Required** |
| `PORT`           | Server port           | `3000`       |

### Session Management

- **Memory Storage**: Chat sessions stored in server memory
- **Auto-cleanup**: Sessions automatically manage message history (max 40 messages)
- **Unique IDs**: Each session gets a unique identifier for context isolation

## 🛠️ Development

### Available Scripts

```bash
npm start          # Start the production server
node index.js      # Direct server start
```

### Adding New Features

1. **Backend**: Add routes in `index.js`
2. **Frontend**: Update `public/script.js` for new functionality
3. **Styling**: Modify `public/style.css` for UI changes

## 📱 Frontend Features

### Chat Interface

- **Auto-expanding textarea**: Grows with message length
- **File attachment button**: Easy file selection with preview
- **Message bubbles**: Distinct styling for user and AI messages
- **Typing indicators**: Shows when AI is processing

### Responsive Design

- **Mobile-first**: Optimized for all screen sizes
- **Touch-friendly**: Large touch targets for mobile users
- **Flexible layout**: Adapts to different viewport sizes

## 🤖 AI Models Used

- **Gemini 2.5 Flash**: Text, images, audio, and documents
- **Gemini 2.0 Flash**: Video files (MP4, MOV, WebM)

## 🔒 Security Features

- **Environment Variables**: API keys stored securely
- **File Size Limits**: Controlled by multer configuration
- **CORS Protection**: Configurable cross-origin settings
- **Input Validation**: Server-side request validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Google Gemini AI](https://gemini.google.com/) for the powerful AI capabilities
- [Marked.js](https://marked.js.org/) for markdown rendering
- [Express.js](https://expressjs.com/) for the web framework

---

**Built with ❤️ using Google Gemini AI**
