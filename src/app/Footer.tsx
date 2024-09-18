import { FC } from "react";

import styles from "./Footer.module.css";

const Footer: FC = () => {
  return (
    <footer className={styles.footer}>
      Copyright &copy; 2024 Tech Radar Inc
    </footer>
  );
};

export default Footer;
