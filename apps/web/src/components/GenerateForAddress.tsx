import { useState } from "react";
import useFetch from "../hooks/useFetch";

export const GenerateForAddress = () => {
  const { loading, error, data, postData } = useFetch(
    `${(() => typeof window !== 'undefined' ? window.location.origin : '')()}/api/v1/generateForAddress`,
    {},
    "POST"
  );
  const [address, setAddress] = useState<string>("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setAddress(e.target.value);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await postData({
        blocks: 10,
        address,
      });
    } catch (err) {}
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <label htmlFor="address">Generate blocks for address </label>
        <input
          type="text"
          name="address"
          id="address"
          value={address}
          onChange={onChange}
        ></input>
        <button type="submit">Submit{loading ? "..." : ""}</button>
      </form>
    </>
  );
};
