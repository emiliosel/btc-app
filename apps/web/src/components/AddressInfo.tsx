import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { gloabalConfig } from "../config";
import useFetch from "../hooks/useFetch";
import Button from "@mui/material/Button";

export type AddressInfoProps = {
  hash: string;
  receivedTime: string;
  confirmedTransactionsNumber: number;
  balance: number;
  totalReceive: number;
  totalSpent: number;
  totalUnspent: number;
};

function Row({ name, value }: { name: string; value: string | number }) {
  return (
    <TableRow
      key={name}
      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
    >
      <TableCell component="th" scope="row">
        {name}
      </TableCell>
      <TableCell align="right">{value}</TableCell>
    </TableRow>
  );
}

type SubscribeToAddressProps = {
  hash: string;
};

function SubscribeToAddress({ hash }: SubscribeToAddressProps) {
  const { loading, error, data, postData } = useFetch(
    "http://localhost:3001/api/v1/subscribeToAddress",
    {},
    "POST"
  );

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await postData({
        userId: gloabalConfig.USER_ID,
        address: hash,
      });
    } catch (err) {}
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <Button type="submit" variant="outlined">Subscribe address{loading ? "..." : ""}</Button>
      </form>
    </>
  );
};

export default function AddressInfo(props: AddressInfoProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableBody>
          <Row name="Hash" value={props.hash}></Row>
          <Row
            name="Confirmed transactions"
            value={props.confirmedTransactionsNumber}
          ></Row>
          <Row name="Balance" value={props.balance}></Row>
          <Row name="Total received" value={props.totalReceive}></Row>
          <Row name="Total spent" value={props.totalSpent}></Row>
          <Row name="Total unspent" value={props.totalUnspent}></Row>
        </TableBody>
      </Table>
      <SubscribeToAddress hash={props.hash} />
    </TableContainer>
  );
}
