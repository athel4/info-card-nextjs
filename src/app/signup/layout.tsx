import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - Info Card Sorter",
  description: "Create a new account.",
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
