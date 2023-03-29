import { useState, useEffect } from "react";
import { gloabalConfig } from "../config";
import useFetch from "../hooks/useFetch";
import Button from "@mui/material/Button";

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
  const [messages, setMessages] = useState<any[]>([]);
  // TODO: add config
  const eventSource = useEventSource(
    `http://localhost:3002/sse?userId=${gloabalConfig.USER_ID}`
  );

  const { loading, data, fetchData } = useFetch<{
    notifications: {
      type: "transaction" | "address";
      created: string;
      data: any;
    }[];
  }>("http://localhost:3001/api/v1/notifications");

  useEffect(() => {
    if (data) {
      setMessages((prevNot) => [...prevNot, ...data.notifications]);
    }
  }, [data]);

  const onLoadMore = () => {
    if ( data?.notifications.length ) {
      fetchData({ query: { skip: data?.notifications.length.toString() }})
    }
  }

  useEffect(() => {
    if (eventSource) {
      eventSource.addEventListener("message", (event) => {
        const newMessage = event.data;
        console.log({newMessage})
        try {
          const msg = JSON.parse(newMessage);
          setMessages((prevMessages) => [msg, ...prevMessages]); 
        } catch (er) {
          console.error(er);
        }
      });

      eventSource.addEventListener("error", (event) => {
        console.error("Error connecting to EventSource API endpoint", event);
        eventSource.close();
      });
    }
  }, [eventSource]);

  return (
    <div>
      <h3>Notifications</h3>
      {messages.map((message, index) => (
        <p key={index}>
          {message.type} {message.created} <br />{" "}
          <span
            style={{
              fontSize: "9px",
              background: "lightgray",
              padding: "4px",
              borderRadius: "6px",
            }}
          >
            {message.data && message.data.txid}
            {typeof message.data === 'string'&& message.data}
          </span>
        </p>
      ))}

      {loading && "Loading..."}

      {Boolean(messages.length) && (
        <Button variant="outlined" onClick={onLoadMore}>
          load more
        </Button>
      )}
    </div>
  );
}

export default NotificationsList;
