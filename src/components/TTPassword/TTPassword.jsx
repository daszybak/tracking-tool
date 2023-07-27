import NounEye from "@/src/icons/NounEye";
import { Password } from "primereact/password";

export default function TTPassword({
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
      <Password
        inputId={id}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        toggleMask
        promptLabel="Enter 6 characters or more"
        mediumRegex={/.{6,}/}
        autoComplete={autoComplete ?? "current-password"}
        feedback
        // TODO add icon
        // icon={<NounEye />}
        {...props}
      />
      <label htmlFor="confirm-password">{label}</label>
    </span>
  );
}
