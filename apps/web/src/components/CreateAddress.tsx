import useFetch from "../hooks/useFetch";

export const CreateAddress = ({ onCreated }: { onCreated: () => void}) => {
  const { loading, error, data, postData } = useFetch(
    `${(() => typeof window !== 'undefined' ? window.location.origin : '')()}/api/v1/createAddress`,
    {},
    "POST"
  );
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await postData({});
      onCreated();
    } catch (err) {}
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <button type="submit">Create address{loading ? "..." : ""}</button>
      </form>
    </>
  );
};
