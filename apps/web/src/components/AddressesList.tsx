import useFetch from "../hooks/useFetch"

export const AddressesList = () => {
  const {loading, error, data} = useFetch<{addresses: string[]}>("http://localhost:3001/api/v1/addresses");

  if (loading) {
    return <h3>Loading...</h3>
  }

  if (error) {
    return <h3>Error loading...</h3>
  }

  if (!data) {
    return <h3>No data found!</h3>
  }

  return <>
    <h4>Addresses</h4>
    <ul>
      {data.addresses.map((address, i) => <li key={i}>{address}</li>)}
    </ul>
  </>
}