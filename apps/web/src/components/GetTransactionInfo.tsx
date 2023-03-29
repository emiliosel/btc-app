import { useState } from "react";
import useFetch from "../hooks/useFetch";
import TransactionInfo from "./TransactionInfo";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Stack, Typography } from "@mui/material";

export const GetTransactionInfo = () => {
  const { loading, error, data, fetchData } = useFetch<any>(
    "http://localhost:3001/api/v1/transactionInfo", {fetchOnRender: false}
  );
  const [transaction, setTransaction] = useState<string>("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setTransaction(e.target.value);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await fetchData({
        query: {
          transactionId: transaction,
        },
      });
    } catch (err) {}
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <Stack spacing={2}>
          <label htmlFor="transaction">
            <Typography variant="h5">Get transaction info </Typography>
          </label>
          <TextField
            type="text"
            name="transaction"
            id="transaction"
            variant="outlined"
            value={transaction}
            onChange={onChange}
            fullWidth
          ></TextField>
          <div>
            <Button type="submit" variant="outlined">Submit{loading ? "..." : ""}</Button>
          </div>
        </Stack>
      </form>

      {data && <div>{`Transaction info: `}</div>}
      {data && (
        <TransactionInfo
          hash={data.transaction.hash}
          size={data.transaction.size}
          receivedTime={data.transaction.receivedTime}
          status={data.transaction.status}
          confirmations={data.transaction.confirmations}
          totalInput={data.transaction.totalInputs}
          totalOutput={data.transaction.totalOutputs}
          fees={data.transaction.fees}
        />
      )}
      {error && transaction && <div>{`Error: ${error.message}`}</div>}
    </>
  );
};
