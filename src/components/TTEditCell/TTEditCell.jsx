import { InputText } from "primereact/inputtext";
import { useEffect, useState, memo } from "react";

const TTEditCell = (props) => {
  const [value, setValue] = useState(props.value);

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  const onEditorValueChange = (e) => {
    setValue(e.target.value);
    if (props.editorCallback) {
      props.editorCallback(e.target.value);
    }
  };

  return (
    <InputText type="text" value={value} style={{ width: "100%" }} onChange={onEditorValueChange} />
  );
};

export default memo(TTEditCell);
