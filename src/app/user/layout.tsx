import type { ReactNode } from "react";
import UserLayoutClient from "./UserLayoutClient";

interface UserLayoutProps {
  children: ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  return <UserLayoutClient>{children}</UserLayoutClient>;
}
