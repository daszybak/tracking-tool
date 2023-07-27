"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./authentication.module.css";
import Image from "next/image";
import NounUser from "@/src/icons/NounUser";

export default function AuthenticaionLayout({ children }) {
  const path = usePathname();
  return (
    <div className={styles["wrapper"]}>
      <div className={styles["container"]}>{children}</div>
      <div className={styles["option-container"]}>
        {path === "/login" ? (
          <>
            <NounUser />
            <div>
              <p>Need an account?</p>
              <Link href="/signup">Register here</Link>
            </div>
          </>
        ) : (
          <div>
            <p>Already have an account?</p>
            <Link href="/login">Login here</Link>
          </div>
        )}
      </div>
    </div>
  );
}
