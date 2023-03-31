import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import useFetch from "../hooks/useFetch";
import { gloabalConfig } from "../config";
import Button from "@mui/material/Button";

export type TransactionInfoProps = {
  hash: string
  receivedTime: string
  status: string
  size: string
  confirmations: number
  totalInput: number
  totalOutput: number
  fees: number
}

function Row({name, value}: { name: string, value: string | number }) {
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

type SubscribeToTransactionProps = {
  hash: string;
};

function SubscribeToTransaction({ hash }: SubscribeToTransactionProps) {
  const { loading, error, data, postData } = useFetch(
    `${(() => typeof window !== 'undefined' ? window.location.origin : '')()}/api/v1/subscribeToTransaction`,
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
        <Button type="submit">Subscribe transaction{loading ? "..." : ""}</Button>
      </form>
    </>
  );
};

export default function TransactionInfo(props: TransactionInfoProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableBody>
          <Row name="Hash" value={props.hash}></Row>
          <Row name="Received time" value={props.receivedTime}></Row>
          <Row name="Status" value={props.status}></Row>
          <Row name="Size" value={props.size}></Row>
          <Row name="Confirmations" value={props.confirmations}></Row>
          <Row name="Total input" value={props.totalInput}></Row>
          <Row name="Total output" value={props.totalOutput}></Row>
          <Row name="Fees" value={props.fees}></Row>
        </TableBody>
      </Table>
      <SubscribeToTransaction hash={props.hash}/>
    </TableContainer>
  );
}
