import { AddressesList } from "../components/AddressesList";
import { GenerateForAddress } from "../components/GenerateForAddress";
import { GetAddressInfo } from "../components/GetAddressInfo";
import { GetTransactionInfo } from "../components/GetTransactionInfo";
import NotificationsList from "../components/Notifications";
import { SubscribeToAddress } from "../components/SubscribeToAddres";
import { TransferToAddress } from "../components/TransferToAddress";

export default function Web() {
  return (
    <div>
      <h1>Web</h1>
      <AddressesList></AddressesList>
      <GenerateForAddress></GenerateForAddress>
      <GetAddressInfo></GetAddressInfo>
      <GetTransactionInfo></GetTransactionInfo>
      <TransferToAddress></TransferToAddress>
      <SubscribeToAddress></SubscribeToAddress>
      <NotificationsList></NotificationsList>
    </div>
  );
}
