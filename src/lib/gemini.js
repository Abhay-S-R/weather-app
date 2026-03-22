// Send a message to the backend chat proxy.
// history: array of { role: "user" | "assistant", text: string }
export const sendChatMessage = async (city, weatherData, history, message) => {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, weatherData, history, message }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error("Chat fetch error:", error);
    throw error;
  }
};
