import { InputText } from "primereact/inputtext";
import { memo } from "react";

export default memo(function TTEditCell(props) {
  return (
    <InputText
      type="text"
      value={props.value}
      style={{ width: "100%" }}
      onChange={(e) => {
        props.editorCallback(e.currentTarget.value);
      }}
    />
  );
});
