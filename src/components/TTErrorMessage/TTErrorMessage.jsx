import { Message } from "primereact/message";

export default function TTErrorMessage({ error }) {
  return (
    <Message
      style={{
        border: "solid #696cff",
        borderWidth: "0 0 0 6px",
        color: "#696cff",
      }}
      severity="severe"
      content={error.toString()}
    />
  );
}
