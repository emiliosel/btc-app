import { useState, useEffect } from "react";
import { gloabalConfig } from "../config";

function useEventSource(url: string) {
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  useEffect(() => {
    const source = new EventSource(url);
    setEventSource(source);

    return () => {
      source.close();
    };
  }, [url]);

  return eventSource;
}

function NotificationsList() {
  const [messages, setMessages] = useState<string[]>([]);
  // TODO: add config
  const eventSource = useEventSource(
    `http://localhost:3002/sse?userId=${gloabalConfig.USER_ID}`
  );

  useEffect(() => {
    if (eventSource) {
      eventSource.addEventListener("message", (event) => {
        const newMessage = event.data;
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });

      eventSource.addEventListener("error", (event) => {
        console.error("Error connecting to EventSource API endpoint", event);
        eventSource.close();
      });
    }
  }, [eventSource]);

  return (
    <div>
      {messages.map((message, index) => (
        <p key={index}>{message}</p>
      ))}
    </div>
  );
}

export default NotificationsList;
