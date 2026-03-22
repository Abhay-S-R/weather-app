import "./ChatPanel.css";
import { useState, useEffect, useRef } from "react";
import { sendChatMessage } from "../../lib/gemini";

const SUGGESTED_PROMPTS = [
  "🧥 Clothing advice",
  "🏃 Outdoor activities?",
  "🚗 Is it safe to drive?",
  "☂️ Do I need an umbrella?",
  "🌡️ Health tips for today",
];

function ChatPanel({ weather }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const prevCityRef = useRef(null);
  const panelRef = useRef(null);
  const fabRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reset chat session when city changes
  useEffect(() => {
    if (!weather) return;
    if (prevCityRef.current === weather.city) return;
    prevCityRef.current = weather.city;

    // Reset state for new city
    setMessages([]);
    setHasGreeted(false);
    setIsOpen(false);
    setIsLoading(false);
  }, [weather]);

  // Close panel on click outside (but not when clicking the FAB itself)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isOpen &&
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        fabRef.current &&
        !fabRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // When FAB is clicked: open panel & send auto-greeting if first time
  const handleFabClick = async () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);

    if (hasGreeted || !weather) return;

    // First open — initialize chat and send greeting
    setIsLoading(true);
    setHasGreeted(true);

    try {
      const greeting = await sendChatMessage(
        weather.city,
        weather,
        [],
        "Give me a quick overview of today's weather and what to expect.",
      );

      setMessages([{ role: "assistant", text: greeting }]);
    } catch (err) {
      console.error("Chat init error:", err);
      setMessages([
        {
          role: "assistant",
          text: err.message || "Hi! I'm your weather assistant. Ask me anything about the weather! 🌤️",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || isLoading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setIsLoading(true);

    try {
      const reply = await sendChatMessage(weather.city, weather, messages, trimmed);
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: err.message || "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!weather) return null;

  return (
    <>
      {/* Floating Action Button */}
      <button
        ref={fabRef}
        className={`chat-fab ${isOpen ? "active" : ""}`}
        onClick={handleFabClick}
        title="Weather Assistant"
        aria-label={isOpen ? "Close weather assistant" : "Open weather assistant"}
        aria-expanded={isOpen}
      >
        <span className="chat-fab-icon" aria-hidden="true">{isOpen ? "✕" : "💬"}</span>
        <span className="chat-fab-pulse" aria-hidden="true" />
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="chat-panel" ref={panelRef} role="dialog" aria-label="Weather assistant chat">
          <div className="chat-panel-header">
            <span className="chat-header-icon" aria-hidden="true">🤖</span>
            <div className="chat-header-text">
              <span className="chat-header-title">Weather Assistant</span>
              <span className="chat-header-subtitle">{weather.city}</span>
            </div>
          </div>

          <div className="chat-messages" role="log" aria-live="polite" aria-label="Chat messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-msg chat-msg-${msg.role}`}>
                {msg.role === "assistant" && (
                  <span className="chat-avatar" aria-hidden="true">🤖</span>
                )}
                <div className={`chat-bubble ${msg.text.includes("touch grass") || msg.text.includes("take rest") ? "error-bubble" : ""}`}>
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="chat-msg chat-msg-assistant">
                <span className="chat-avatar" aria-hidden="true">🤖</span>
                <div className="chat-bubble chat-typing" role="status" aria-label="Assistant is typing">
                  <span className="dot" aria-hidden="true" />
                  <span className="dot" aria-hidden="true" />
                  <span className="dot" aria-hidden="true" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested prompts */}
          {messages.length <= 1 && !isLoading && (
            <div className="chat-suggestions">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  className="chat-chip"
                  onClick={() => handleSend(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <div className="chat-input-row">
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              placeholder="Ask about the weather..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              aria-label="Ask about the weather"
            />
            <button
              className="chat-send-btn"
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
            >
              <span aria-hidden="true">➤</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatPanel;
