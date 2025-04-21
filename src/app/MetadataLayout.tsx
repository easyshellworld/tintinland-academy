// app/MetadataLayout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "lxdao-learn-test",
  description: "lxdao-learn-test",
};

export default function MetadataLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}