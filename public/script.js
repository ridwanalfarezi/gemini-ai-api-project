// DOM Elements
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const chatMessages = document.getElementById("chatMessages");
const fileInput = document.getElementById("fileInput");
const attachBtn = document.getElementById("attachBtn");
const filePreview = document.getElementById("filePreview");
const loadingSpinner = document.getElementById("loadingSpinner");
const chatLoading = document.getElementById("chatLoading");
const clearChatBtn = document.getElementById("clearChatBtn");

// API Base URL
const API_BASE = window.location.origin;

// Store selected files and session management
let selectedFiles = [];
let sessionId = generateSessionId();

// Generate unique session ID
function generateSessionId() {
  return (
    "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
  );
}

// Auto-expand textarea
chatInput.addEventListener("input", autoExpandTextarea);
chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

function autoExpandTextarea() {
  chatInput.style.height = "auto";
  chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + "px";
}

// Chat functionality
sendBtn.addEventListener("click", sendMessage);

// Clear chat functionality
clearChatBtn.addEventListener("click", clearChat);

// File attachment functionality
attachBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", handleFileSelection);

function handleFileSelection(event) {
  const files = Array.from(event.target.files);
  selectedFiles = [...selectedFiles, ...files];
  updateFilePreview();
  event.target.value = ""; // Reset input to allow selecting same file again
}

function updateFilePreview() {
  if (selectedFiles.length === 0) {
    filePreview.classList.add("hidden");
    return;
  }

  filePreview.classList.remove("hidden");
  filePreview.innerHTML = selectedFiles
    .map((file, index) => {
      const fileIcon = getFileIcon(file.type);
      const fileSize = formatFileSize(file.size);

      return `
      <div class="file-item">
        <div class="file-info">
          <span class="file-icon">${fileIcon}</span>
          <div>
            <div class="file-name">${file.name}</div>
            <div class="file-size">${fileSize}</div>
          </div>
        </div>
        <button class="remove-file" onclick="removeFile(${index})">×</button>
      </div>
    `;
    })
    .join("");
}

function removeFile(index) {
  selectedFiles.splice(index, 1);
  updateFilePreview();
}

function getFileIcon(mimeType) {
  if (mimeType.startsWith("image/")) return "🖼️";
  if (mimeType.startsWith("video/")) return "🎥";
  if (mimeType.startsWith("audio/")) return "🎵";
  if (mimeType.includes("pdf")) return "📄";
  if (mimeType.includes("text")) return "📝";
  return "📁";
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

async function sendMessage() {
  const message = chatInput.value.trim();
  const hasFiles = selectedFiles.length > 0;

  if (!message && !hasFiles) return;

  // Show user message and files if any
  if (message) {
    addMessage("user", message);
  }

  if (hasFiles) {
    addFileMessage("user", selectedFiles);
  }

  chatInput.value = "";
  chatInput.style.height = "auto"; // Reset height

  // Add typing indicator as AI message
  const typingMessage = addTypingMessage();

  // Disable send button during processing
  sendBtn.disabled = true;
  sendBtn.textContent = "Sending...";

  try {
    let response;

    if (hasFiles) {
      // Send files with message using upload-describe endpoint
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      // Add custom instruction if provided
      if (message) {
        formData.append("instruction", message);
      }

      // Add session ID for conversation history
      formData.append("sessionId", sessionId);

      response = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        body: formData,
      });
    } else {
      // Send text-only message with session context
      response = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          sessionId: sessionId,
        }),
      });
    }

    const data = await response.json();

    if (hasFiles && response.ok) {
      // Handle file upload response
      if (data.results) {
        let combinedResponse = "";
        data.results.forEach((result, index) => {
          if (result.error) {
            combinedResponse += `Error with ${result.file}: ${result.error}`;
          } else {
            combinedResponse += result.description;
          }
          if (index < data.results.length - 1) combinedResponse += "\n\n";
        });
        replaceTypingMessage(typingMessage, combinedResponse);
      }
    } else if (response.ok) {
      // Handle text chat response
      replaceTypingMessage(typingMessage, data.reply);
    } else {
      replaceTypingMessage(typingMessage, `Error: ${data.error}`);
    }
  } catch (error) {
    replaceTypingMessage(typingMessage, `Error: ${error.message}`);
  }

  // Clear selected files and hide preview
  selectedFiles = [];
  updateFilePreview();

  // Re-enable send button
  sendBtn.disabled = false;
  sendBtn.textContent = "Send";
}

function addMessage(sender, text) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${sender}`;

  if (sender === "bot") {
    // Format bot messages with proper HTML rendering
    messageDiv.innerHTML = formatBotResponse(text);
  } else {
    messageDiv.textContent = text;
  }

  chatMessages.appendChild(messageDiv);

  // Add clearfix after message
  const clearDiv = document.createElement("div");
  clearDiv.style.clear = "both";
  clearDiv.style.height = "0";
  chatMessages.appendChild(clearDiv);

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function formatBotResponse(text) {
  // Configure marked options for better rendering
  marked.setOptions({
    breaks: true, // Convert line breaks to <br>
    gfm: true, // Enable GitHub Flavored Markdown
    headerIds: false, // Disable header IDs
    mangle: false, // Don't mangle autolinked email addresses
  });

  // Use marked.js to parse markdown
  return marked.parse(text);
}

function addFileMessage(sender, files) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${sender}`;

  const filesInfo = files
    .map((file) => {
      const icon = getFileIcon(file.type);
      return `${icon} ${file.name}`;
    })
    .join(", ");

  messageDiv.textContent = `📎 Uploaded: ${filesInfo}`;
  chatMessages.appendChild(messageDiv);

  // Add clearfix after message
  const clearDiv = document.createElement("div");
  clearDiv.style.clear = "both";
  clearDiv.style.height = "0";
  chatMessages.appendChild(clearDiv);

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addTypingMessage() {
  const messageDiv = document.createElement("div");
  messageDiv.className = "message bot typing";

  // Create typing indicator with animated dots
  const typingIndicator = document.createElement("div");
  typingIndicator.className = "typing-indicator";
  typingIndicator.innerHTML = `
    <span class="typing-text">AI is thinking</span>
    <span class="typing-dots">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </span>
  `;

  messageDiv.appendChild(typingIndicator);
  chatMessages.appendChild(messageDiv);

  // Add clearfix after message
  const clearDiv = document.createElement("div");
  clearDiv.style.clear = "both";
  clearDiv.style.height = "0";
  chatMessages.appendChild(clearDiv);

  chatMessages.scrollTop = chatMessages.scrollHeight;

  return messageDiv;
}

function replaceTypingMessage(typingMessageDiv, actualResponse) {
  typingMessageDiv.className = "message bot";
  typingMessageDiv.innerHTML = formatBotResponse(actualResponse);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showLoading(show) {
  if (show) {
    loadingSpinner.classList.remove("hidden");
  } else {
    loadingSpinner.classList.add("hidden");
  }
}

function showChatLoading(show) {
  if (show) {
    chatLoading.classList.remove("hidden");
  } else {
    chatLoading.classList.add("hidden");
  }
}

// Clear chat functionality
async function clearChat() {
  if (
    confirm(
      "Are you sure you want to clear the chat history? This will start a new conversation."
    )
  ) {
    try {
      // Clear chat on server
      await fetch(`${API_BASE}/api/clear-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId: sessionId }),
      });

      // Generate new session ID
      sessionId = generateSessionId();

      // Clear chat messages on frontend
      chatMessages.innerHTML = "";

      // Add welcome message
      addMessage(
        "bot",
        "Hello! I'm your Gemini AI assistant. You can chat with me or attach files (📎) with custom instructions. How can I help you today?"
      );

      // Clear any selected files
      selectedFiles = [];
      updateFilePreview();
    } catch (error) {
      console.error("Error clearing chat:", error);
      alert("Failed to clear chat history. Please try again.");
    }
  }
}

// Initialize
addMessage(
  "bot",
  "Hello! I'm your Gemini AI assistant. You can chat with me or attach files (📎) with custom instructions. How can I help you today?"
);
