import { AddressesList } from "../components/AddressesList";
import { GenerateForAddress } from "../components/GenerateForAddress";
import NotificationsList from "../components/Notifications";
import { SubscribeToAddress } from "../components/SubscribeToAddres";

const API_HOST = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:3001";

export default function Web() {
  return (
    <div>
      <h1>Web</h1>
      <AddressesList></AddressesList>
      <SubscribeToAddress></SubscribeToAddress>
      <NotificationsList></NotificationsList>
      <GenerateForAddress></GenerateForAddress>
    </div>
  );
}
