"use client";

import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/src/contexts/AuthContext";
import NounTime from "@/src/icons/Nountime";
import NounHistory from "@/src/icons/NounHistory";
import NounTurnOff from "@/src/icons/NounTurnOff";
import { usePathname } from "next/navigation";
import styles from "./navbar.module.css";

export default function Navbar() {
  const { user, loadingUser, logOut } = useUser();
  const isSecure = !loadingUser && user;
  const path = usePathname();
  return (
    <div className={styles.navbar}>
      <Link href="/" className={styles["logo"]}>
        <Image priority src="/devot_logo.svg" alt="Devot" width={162} height={44} />
        <h1>Tracking Tool</h1>
      </Link>
      {isSecure && (
        <ul>
          <li
            className={`${styles["internal-link"]}${
              path === "/trackers" ? ` ${styles["active"]}` : ""
            }`}
          >
            <Link href="/trackers">
              <NounTime /> Trackers
            </Link>
          </li>
          <li
            className={`${styles["internal-link"]}${
              path === "/history" ? ` ${styles["active"]}` : ""
            }`}
          >
            <Link href="/history">
              <NounHistory /> History
            </Link>
          </li>
          <li>
            <Link href="" onClick={() => logOut()}>
              <NounTurnOff /> Logout
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}
