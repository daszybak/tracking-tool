"use client";

import React from "react";
import { Button } from "primereact/button";
import { useUser } from "@/src/contexts/AuthContext";
import useForm from "@/src/hooks/useForm";
import TTTextInput from "@/src/components/TTTextInput/TTTextInput";
import TTPassword from "@/src/components/TTPassword/TTPassword";
import TTErrorMessage from "@/src/components/TTErrorMessage/TTErrorMessage";
import useErrors from "@/src/hooks/useErrors";

export default function Login() {
  const { signIn } = useUser();
  const {
    state,
    handleUsernameChange,
    handlePasswordChange,
    handleUsernameBlur,
    handlePasswordBlur,
  } = useForm();
  const { isErrors, addError, clearErrors, getErrorsString } = useErrors();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!state.usernameError && !state.passwordError) {
        await signIn(state.username, state.password);
        clearErrors();
      }
    } catch (error) {
      addError(error);
    }
  };

  // TODO add validation messages
  return (
    <form className="p-fluid auth-form" onSubmit={handleSubmit}>
      <h1>Login</h1>
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
      />
      <Button label="Login" type="submit" className="submit-button" />
      {isErrors && <TTErrorMessage error={getErrorsString()} />}
    </form>
  );
}
