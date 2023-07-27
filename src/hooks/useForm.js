import { useReducer } from 'react';

const initialState = {
  username: "",
  password: "",
  confirmPassword: "",
  usernameError: false,
  passwordError: false,
  confirmPasswordError: false
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USERNAME':
      return { ...state, username: action.payload };
    case 'SET_PASSWORD':
      return { ...state, password: action.payload };
    case 'SET_CONFIRM_PASSWORD':
      return { ...state, confirmPassword: action.payload };
    case 'SET_USERNAME_ERROR':
      return { ...state, usernameError: action.payload };
    case 'SET_PASSWORD_ERROR':
      return { ...state, passwordError: action.payload };
    case 'SET_CONFIRM_PASSWORD_ERROR':
      return { ...state, confirmPasswordError: action.payload };
    default:
      return state;
  }
}

export default function useForm() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleUsernameChange = (e) => {
    dispatch({ type: 'SET_USERNAME', payload: e.target.value });
  };

  const handlePasswordChange = (e) => {
    dispatch({ type: 'SET_PASSWORD', payload: e.target.value });
  };

  const handleConfirmPasswordChange = (e) => {
    dispatch({ type: 'SET_CONFIRM_PASSWORD', payload: e.target.value });
  };

  const handleUsernameBlur = () => {
    dispatch({ type: 'SET_USERNAME_ERROR', payload: state.username.length < 1 });
  };

  const handlePasswordBlur = () => {
    dispatch({ type: 'SET_PASSWORD_ERROR', payload: state.password.length < 1 });
  };

  const handleConfirmPasswordBlur = () => {
    dispatch({ type: 'SET_CONFIRM_PASSWORD_ERROR', payload: state.confirmPassword !== state.password || state.confirmPassword.length < 1 });
  };

  return {
    state,
    handleUsernameChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleUsernameBlur,
    handlePasswordBlur,
    handleConfirmPasswordBlur
  };
}
