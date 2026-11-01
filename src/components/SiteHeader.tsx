import { getCustomerSession } from "@/server/customer/session";
import Navbar from "./Navbar";

export default async function SiteHeader() {
  const session = await getCustomerSession();
  return <Navbar signedIn={Boolean(session)} />;
}
