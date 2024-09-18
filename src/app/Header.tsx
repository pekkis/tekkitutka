import { FC } from "react";

import styles from "./Header.module.css";
import Link from "next/link";

const Header: FC = () => {
  return (
    <header className={styles.header}>
      <Link className={styles.link} href="/">
        Tech Radars
      </Link>
    </header>
  );
};

export default Header;
