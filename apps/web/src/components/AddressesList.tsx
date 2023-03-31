import { useCallback } from "react";
import useFetch from "../hooks/useFetch"
import { CreateAddress } from "./CreateAddress";

export const AddressesList = () => {
  const {loading, error, data, fetchData} = useFetch<{addresses: string[]}>(`${(() => typeof window !== 'undefined' ? window.location.origin : '')()}/api/v1/addresses`);

  const onCreatedAddress = useCallback(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return <h3>Loading...</h3>
  }

  if (error) {
    return <h3>Error loading...</h3>
  }

  if (!data) {
    return <h3>No data found!</h3>
  }

  return (
    <>
      <h4>Addresses</h4>
      <CreateAddress onCreated={onCreatedAddress}/>
      <ul>
        {data.addresses.map((address, i) => (
          <li key={address}>{address}</li>
        ))}
      </ul>
    </>
  );
}