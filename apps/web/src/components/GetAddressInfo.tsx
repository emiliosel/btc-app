import { useState } from "react";
import useFetch from "../hooks/useFetch";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import AddressInfo from "./AddressInfo";
import Stack from "@mui/material/Stack";

type ApiAddressInfoResponseData = {
  address: {
    confirmedTransactionsNumber: number;
    balance: number;
    totalReceive: number;
    totalSpent: number;
    totalUnspent: number;
    receivedTime: string;
  };
};

export const GetAddressInfo = () => {
  const { loading, error, data, fetchData } =
    useFetch<ApiAddressInfoResponseData>(
      `${(() => typeof window !== 'undefined' ? window.location.origin : '')()}/api/v1/addressInfo`,
      { fetchOnRender: false }
    );
  const [address, setAddress] = useState<string>("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setAddress(e.target.value);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await fetchData({
        query: {
          address,
        },
      });
    } catch (err) {}
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <Stack spacing={2}>
          <label htmlFor="address">
            <Typography variant="h5">Get address info</Typography>
          </label>
          <TextField
            type="text"
            name="address"
            id="address"
            value={address}
            onChange={onChange}
          ></TextField>

          <div>
            <Button type="submit" variant="outlined">
              Submit{loading ? "..." : ""}
            </Button>
          </div>
        </Stack> 
      </form>
      {data && <div>Address info:</div>}
      {data && (
        <AddressInfo
          hash={address}
          confirmedTransactionsNumber={data.address.confirmedTransactionsNumber}
          balance={data.address.balance}
          totalReceive={data.address.totalReceive}
          totalSpent={data.address.totalSpent}
          receivedTime={data.address.receivedTime}
          totalUnspent={data.address.totalUnspent}
        />
      )}
      {error && <div>{`Error: ${error.message}`}</div>}
    </>
  );
};
