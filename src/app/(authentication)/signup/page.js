"use client";

import React from "react";
import { Button } from "primereact/button";
import { useUser } from "@/src/contexts/AuthContext";
import useForm from "@/src/hooks/useForm";
import TTPassword from "@/src/components/TTPassword/TTPassword";
import TTTextInput from "@/src/components/TTTextInput/TTTextInput";
import TTErrorMessage from "@/src/components/TTErrorMessage/TTErrorMessage";
import useErrors from "@/src/hooks/useErrors";

export default function SignUp() {
  const { signUp } = useUser();
  const {
    state,
    handleUsernameChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleUsernameBlur,
    handlePasswordBlur,
    handleConfirmPasswordBlur,
  } = useForm();
  const { isErrors, addError, clearErrors, getErrorsString } = useErrors();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!state.usernameError && !state.passwordError && !state.confirmPasswordError) {
        await signUp(state.username, state.password);
        clearErrors();
      }
    } catch (error) {
      addError(error);
    }
  };

  // TODO add validation messages
  return (
    <form className="p-fluid auth-form" onSubmit={handleSubmit}>
      <h1>Sign Up</h1>
      <TTTextInput
        className="username-field"
        value={state.username}
        onBlur={handleUsernameBlur}
        onChange={handleUsernameChange}
        id="username"
        label="Username"
        autoComplete={"username"}
      />
      <TTPassword
        className="password-field"
        value={state.password}
        onBlur={handlePasswordBlur}
        onChange={handlePasswordChange}
        id="password"
        label="Password"
        autoComplete={"new-password"}
      />
      <TTPassword
        className="confirm-password-field"
        value={state.confirmPassword}
        onBlur={handleConfirmPasswordBlur}
        onChange={handleConfirmPasswordChange}
        id="confirm-password"
        label="Confirm Password"
        autoComplete={"confirm-password"}
      />
      <Button type="submit" label="Sign Up" className="submit-button" />
      {isErrors && <TTErrorMessage error={getErrorsString()} />}
    </form>
  );
}
