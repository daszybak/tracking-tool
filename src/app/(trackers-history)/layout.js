import styles from "./trackers.module.css";

export default function TrackersLayout({ children }) {
  return <div className={`${styles["container"]} trackers-history`}>{children}</div>;
}
