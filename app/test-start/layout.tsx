import { PRIVATE_PAGE } from "@/lib/site";

export const metadata = PRIVATE_PAGE;

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
