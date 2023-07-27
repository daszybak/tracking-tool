import { InputText } from "primereact/inputtext";

export default function TTTextInput({
  autoComplete,
  value,
  id,
  className,
  label,
  onChange,
  onBlur,
  ...props
}) {
  return (
    <span className={`p-float-label${className ? " " + className : ""}`}>
      <InputText
        autoComplete={autoComplete}
        id={id}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        {...props}
      />
      <label htmlFor="username">{label}</label>
    </span>
  );
}
