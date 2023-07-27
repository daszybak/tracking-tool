"use client";

import { useState, useEffect, createContext, useContext } from "react";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import app from "../firebase";

export const UserContext = createContext({
  user: null,
  setUser: () => {},
  loadingUser: true,
  signUp: async () => {},
  signIn: async () => {},
  logOut: async () => {},
});

export default function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const auth = getAuth(app);
  const db = getFirestore(app);

  // enable signup with only username and password
  const signUp = async (username, password) => {
    try {
      const fullEmail = `${username}@tracking-tool.com`;
      const userCredential = await createUserWithEmailAndPassword(auth, fullEmail, password);
      const user = userCredential.user;
      const { uid } = user;
      setUser({ uid, username });

      await setDoc(doc(db, "users", uid), {
        username,
        email: fullEmail,
      });
    } catch (error) {
      // TODO handle error
      throw error;
    }
  };

  const signIn = async (username, password) => {
    try {
      const fullEmail = `${username}@tracking-tool.com`;
      const userCredential = await signInWithEmailAndPassword(auth, fullEmail, password);
      const user = userCredential.user;
      const { uid } = user;
      setUser({ uid, username });
    } catch (error) {
      // TODO handle error
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      // TODO handle error
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const { uid, email } = user;
          setUser({ uid, email });
        } else setUser(null);
      } catch (error) {
        // TODO handle error
        throw error;
      } finally {
        setLoadingUser(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <UserContext.Provider value={{ user, setUser, loadingUser, signUp, signIn, logOut }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
