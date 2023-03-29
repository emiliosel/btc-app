import { useState } from "react";
import useFetch from "../hooks/useFetch";

export const TransferToAddress = () => {
  const { loading, error, data, postData } = useFetch(
    "http://localhost:3001/api/v1/transfer",
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
        amount: 1,
        toAddress: address,
      });
    } catch (err) {}
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <label htmlFor="address">Transfer amount to address </label>
        <input
          type="text"
          name="address"
          id="address"
          value={address}
          onChange={onChange}
        ></input>
        <button type="submit">Submit{loading ? "..." : ""}</button>
      </form>

      {data && <div>{`Transactiond id: ${data}`}</div>}
      {error && <div>{`Error: ${error.message}`}</div>}
      <hr />
    </>
  );
};
