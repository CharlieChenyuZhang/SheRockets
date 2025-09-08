// Test script for AI Tutor API integration
// Run with: node test-ai-tutor-api.js

const testPayload = {
  inputText: "How do rockets work?",
  conversation: [
    { isUser: true, text: "Hello Dr. Luna!" },
    {
      isUser: false,
      text: "Hi there, space explorer! I'm Dr. Luna, your AI tutor and space science mentor. I'm here to help you learn about physics, rockets, and space exploration! What would you like to know? 🚀✨",
    },
  ],
  subject: "Space Science",
  difficulty: "beginner",
  language: "en",
  userId: "test_user_123",
};

async function testAITutorAPI() {
  const apiUrl =
    process.env.NEXT_PUBLIC_AI_TUTOR_API_URL || "http://localhost:8080";

  console.log("Testing AI Tutor API...");
  console.log("API URL:", apiUrl);
  console.log("Payload:", JSON.stringify(testPayload, null, 2));

  try {
    const response = await fetch(`${apiUrl}/api/sherockets-tutor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testPayload),
    });

    console.log("Response Status:", response.status);
    console.log(
      "Response Headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      return;
    }

    const result = await response.json();
    console.log("Success! AI Response:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Network Error:", error.message);
    console.log("\nMake sure your AI tutor API server is running on", apiUrl);
  }
}

testAITutorAPI();
