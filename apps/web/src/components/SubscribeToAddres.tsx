import { useState } from "react";
import useFetch from "../hooks/useFetch"
import { gloabalConfig } from "../config";

export const SubscribeToAddress = () => {
  const {loading, error, data, postData} = useFetch("http://localhost:3001/api/v1/subscribeToAddress", {}, "POST");
  const [address, setAddress] = useState<string>("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setAddress(e.target.value);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await postData({
        userId: gloabalConfig.USER_ID,
        address
      });
    } catch (err) {
    }
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <label htmlFor="address">Subscribe to address </label>
        <input
          type="text"
          name="address"
          id="address"
          value={address}
          onChange={onChange}
        ></input>
        <button type="submit">Submit{loading ? '...' : ''}</button>
      </form>
    </>
  ); 
}