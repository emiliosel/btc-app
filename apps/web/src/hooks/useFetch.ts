import { useState, useEffect } from "react";

function useFetch<T>(url: string, options: {fetchOnRender?: boolean} = {fetchOnRender: true} , method = "GET") {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);
  const fetchData = async (options: { query?: Record<string, string> } = {}) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const urlInstance = new URL(url);
      if (typeof options.query !== 'undefined') {
        Object.keys(options.query).forEach(
          queryParam => urlInstance.searchParams.append(queryParam, (options.query as any)[queryParam])
        ) 
      }
      const response = await fetch(urlInstance, {
        method,
        ...options,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message);
      }

      setData(responseData);
      setLoading(false);

      return responseData
    } catch (error) {
      setError(error as Error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (method === "GET" && options.fetchOnRender) {
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
      return data;
    } catch (error) {
      setError(error as Error);
      setLoading(false);
    }
  };

  return { loading, error, data, postData, fetchData };
}

export default useFetch;
