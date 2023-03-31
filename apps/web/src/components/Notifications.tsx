import { useState, useEffect, useCallback } from "react";
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
  const [couldHaveMore, setHasMore] = useState<boolean>(true);
  // TODO: add config
  const eventSource = useEventSource(
    `${(() => typeof window !== 'undefined' ? window.location.origin : '')()}/sse?userId=${gloabalConfig.USER_ID}`
  );

  const { loading, data, fetchData } = useFetch<{
    notifications: {
      type: "transaction" | "address";
      created: string;
      data: any;
    }[];
  }>(`${(() => typeof window !== 'undefined' ? window.location.origin : '')()}/api/v1/notifications`);
  const loadMore = useFetch<{
    notifications: {
      type: "transaction" | "address";
      created: string;
      data: any;
    }[];
  }>(`${(() => typeof window !== 'undefined' ? window.location.origin : '')()}/api/v1/notifications`, { fetchOnRender: false });
  
  useEffect(() => {
    if (data && Array.isArray(data.notifications)) {
      setMessages(data.notifications);
    }
  }, [data]);

  const onLoadMore = useCallback(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && couldHaveMore) {
      loadMore.fetchData({ query: { after: lastMessage.created }})
        .then((data) => {
          if (data.notifications.length) {
            setMessages((prevNot) => [...prevNot, ...data.notifications]);
            setHasMore(true);
          } else {
            setHasMore(false);
          }
        })
    }
  }, [messages]);

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

      {Boolean(messages.length) && couldHaveMore && (
        <Button variant="outlined" onClick={onLoadMore}>
          load more {loadMore.loading && '...'}
        </Button>
      )}
    </div>
  );
}

export default NotificationsList;
