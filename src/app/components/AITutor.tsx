"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AITutorProps {
  className?: string;
}

export default function AITutor({ className = "" }: AITutorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi there, space explorer! I'm Dr. Luna, your AI tutor and space science mentor. I'm here to help you learn about physics, rockets, and space exploration! What would you like to know? 🚀✨",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({
    x: typeof window !== "undefined" ? window.innerWidth - 100 : 20,
    y: typeof window !== "undefined" ? window.innerHeight - 100 : 20,
  });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isTyping, setIsTyping] = useState(false);
  const [mouseDownTime, setMouseDownTime] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle window resize to keep position in bounds
  useEffect(() => {
    const handleResize = () => {
      const maxX = window.innerWidth - (isOpen ? 350 : 80);
      const maxY = window.innerHeight - (isOpen ? 500 : 80);

      setPosition((prev) => ({
        x: Math.max(0, Math.min(prev.x, maxX)),
        y: Math.max(0, Math.min(prev.y, maxY)),
      }));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  const handleDragStart = (e: React.MouseEvent) => {
    // Only allow dragging from the header when open, or anywhere when closed
    const target = e.target as HTMLElement;
    const isInputArea =
      target.closest("input") ||
      target.closest("button") ||
      target.closest(".messages-container");

    if (isOpen && isInputArea) {
      return; // Don't start drag if clicking on input/button/messages
    }

    setMouseDownTime(Date.now());
    setHasMoved(false);
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    e.preventDefault(); // Prevent default behavior
  };

  const handleDragMove = (e: MouseEvent) => {
    if (isDragging) {
      setHasMoved(true);
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Keep within viewport bounds
      const maxX = window.innerWidth - 350; // Chat width
      const maxY = window.innerHeight - (isOpen ? 500 : 80); // Chat height when open/closed

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    }
  };

  const handleDragEnd = () => {
    const dragDuration = Date.now() - mouseDownTime;
    const wasClick = !hasMoved && dragDuration < 200; // Less than 200ms and no movement = click

    setIsDragging(false);

    // If it was a click (not a drag) and chat is closed, open it
    if (wasClick && !isOpen) {
      setIsOpen(true);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleDragMove);
      document.addEventListener("mouseup", handleDragEnd);
      return () => {
        document.removeEventListener("mousemove", handleDragMove);
        document.removeEventListener("mouseup", handleDragEnd);
      };
    }
  }, [isDragging, dragOffset]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputText);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (input.includes("rocket") || input.includes("launch")) {
      return "Great question about rockets! 🚀 Rockets work using Newton's Third Law - for every action, there's an equal and opposite reaction. When the rocket pushes exhaust gases down, the gases push the rocket up! The more fuel you burn, the more thrust you get. Want to learn about different rocket parts?";
    }

    if (input.includes("physics") || input.includes("science")) {
      return "Physics is amazing! 🌟 It's the study of how things move and interact. In space, we deal with gravity, momentum, and energy. Did you know that in space, you can't hear sounds because there's no air? That's why we see explosions but don't hear them in movies! What specific physics concept interests you?";
    }

    if (input.includes("space") || input.includes("planet")) {
      return "Space is incredible! 🌌 There are 8 planets in our solar system, and each one is unique. Earth is special because it has water and air that we can breathe. Mars is red because of iron oxide (rust) on its surface! Would you like to learn about building a rocket to visit other planets?";
    }

    if (input.includes("help") || input.includes("stuck")) {
      return "I'm here to help! 💫 Try building your rocket step by step. Start with a strong body, add some fuel tanks, and don't forget the engine! If you're having trouble with a specific part, tell me what you're working on and I'll guide you through it!";
    }

    if (input.includes("hello") || input.includes("hi")) {
      return "Hello, future astronaut! 👩‍🚀 I'm so excited to help you on your space journey! I'm Dr. Luna, and I've been studying space science for many years. What's your name, and what would you like to explore today?";
    }

    if (input.includes("fuel") || input.includes("engine")) {
      return "Great question about rocket propulsion! 🔥 Fuel is what makes rockets go! The more fuel you have, the more thrust you can generate. But remember - more fuel also means more weight, so you need to find the perfect balance. Try experimenting with different fuel tank sizes in your rocket builder!";
    }

    if (input.includes("gravity") || input.includes("weight")) {
      return "Gravity is fascinating! 🌍 It's the invisible force that pulls everything toward Earth. To escape Earth's gravity, rockets need to reach about 25,000 mph! That's why we need powerful engines and lots of fuel. The bigger your rocket, the more fuel you'll need to fight gravity!";
    }

    if (input.includes("mars") || input.includes("moon")) {
      return "Exploring other worlds is so exciting! 🌙🚀 The Moon is much closer than Mars, but Mars has an atmosphere (though very thin). Each destination requires different rocket designs. What would you like to know about space travel to these amazing places?";
    }

    // Default responses
    const responses = [
      "That's a wonderful question! 🤔 Let me think about that... In space science, we're always learning new things. Can you tell me more about what you're curious about?",
      "I love your curiosity! ✨ That reminds me of when I was learning about space. Have you tried experimenting with different rocket designs? Sometimes the best way to learn is by trying!",
      "What an interesting thought! 🌟 You know, many famous scientists started with questions just like yours. What made you think about that?",
      "Great thinking! 🚀 You're developing the mind of a true scientist. Have you considered how this might relate to your rocket building?",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className={`fixed z-50 ${className}`}
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleDragStart}
    >
      {/* Chat Container */}
      <div
        className={`bg-black/90 backdrop-blur-sm border-2 border-pink-500/50 rounded-2xl shadow-2xl transition-all duration-300 ${
          isOpen ? "w-80 h-96" : "w-16 h-16"
        } ${isDragging ? "scale-105" : ""} ${
          !isOpen ? "animate-chat-glow" : ""
        }`}
      >
        {isOpen ? (
          <div className="h-full flex flex-col">
            {/* Chat Header */}
            <div className="chat-header flex items-center justify-between p-3 border-b border-pink-500/30 bg-gradient-to-r from-pink-600/20 to-pink-500/20 rounded-t-2xl">
              <div className="flex items-center space-x-2">
                <div className="text-2xl">👩‍🚀</div>
                <div>
                  <h3 className="text-white font-bold text-sm">Dr. Luna</h3>
                  <p className="text-pink-300 text-xs">Your AI Space Tutor</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-pink-300 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="messages-container flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.isUser
                        ? "bg-pink-600 text-white"
                        : "bg-gray-800 text-white border border-pink-500/30"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 text-white border border-pink-500/30 p-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-typing"></div>
                      <div
                        className="w-2 h-2 bg-pink-500 rounded-full animate-typing"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-pink-500 rounded-full animate-typing"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-pink-500/30">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Dr. Luna anything..."
                  className="flex-1 bg-gray-800 border border-pink-500/30 rounded-xl px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-pink-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-xl transition-colors"
                >
                  🚀
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Closed State - Floating Icon */
          <div className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:scale-110 transition-transform">
            <div className="text-3xl animate-chat-glow">👩‍🚀</div>
          </div>
        )}
      </div>
    </div>
  );
}
