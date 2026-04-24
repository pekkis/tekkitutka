import { FC, ReactNode } from "react";

import styles from "./Main.module.css";

type Props = {
  children: ReactNode;
};

const Main: FC<Props> = ({ children }) => {
  return <main className={styles.main}>{children}</main>;
};

export default Main;
