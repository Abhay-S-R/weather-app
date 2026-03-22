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
      
      // If it's a rate limit error, throw the funny backend message directly to the UI
      if (response.status === 429) {
        throw new Error(errorData.error);
      } else {
        // For everything else (like 400 validation or 500 crash), log silently and throw generic string
        console.error(`Backend Error (${response.status}):`, errorData);
        throw new Error("Sorry, I couldn't process that right now. Please try again.");
      }
    }

    const data = await response.json();
    return data.reply;
  } catch (error) {
    // If we threw one of our intended messages above, just rethrow it smoothly
    if (
      error.message === "Sorry, I couldn't process that right now. Please try again." ||
      error.message.includes("touch grass") ||
      error.message.includes("take rest")
    ) {
      throw error;
    }
    
    // Catch generic pure network fail (like internet off)
    console.error("Chat network error:", error);
    throw new Error("Sorry, I couldn't process that right now. Please try again.");
  }
};
