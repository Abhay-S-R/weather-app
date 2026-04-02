export const sendChatMessage = async (city, weatherData, history, message) => {
  let response;

  try {
    response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, weatherData, history, message }),
    });
  } catch (err) {
    console.error("Chat network error:", err);
    throw new Error("Sorry, I couldn't process that right now. Please try again.");
  }

  // Handle rate-limit errors outside try-catch so they never get swallowed
  if (response.status === 429) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || "Too many requests. Please try again later."
    );
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error(`Backend Error (${response.status}):`, errorData);
    throw new Error("Sorry, I couldn't process that right now. Please try again.");
  }

  const data = await response.json();
  return data.reply;
};
