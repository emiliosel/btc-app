import { useState, useEffect } from "react";

function useFetch<T>(url: string, options = {}, method = "GET") {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setData(null);

      try {
        const response = await fetch(url, {
          method,
          ...options,
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.message);
        }

        setData(responseData);
        setLoading(false);
      } catch (error) {
        setError(error as Error);
        setLoading(false);
      }
    };
    if (method === "GET") {
      fetchData();
    }
  }, []);

  const postData = async (postData: any) => {
    try {
      setLoading(true);
      const response = await fetch(url, {
        ...options,
        method: "POST",
        headers: {
          ...(options as any).headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });
      const data = await response.json();
      setData(data);
      setLoading(false);
    } catch (error) {
      setError(error as Error);
      setLoading(false);
    }
  };

  return { loading, error, data, postData };
}

export default useFetch;
