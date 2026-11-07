import Footer from "@/components/Footer";
import AccountNav from "@/components/account/AccountNav";
import CustomerLogoutButton from "@/components/account/CustomerLogoutButton";
import SiteHeader from "@/components/SiteHeader";
import { requireCustomerPage } from "@/server/customer/session";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  await requireCustomerPage();

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-ivory pt-24 font-display sm:pt-28">
        <div className="min-h-[calc((100dvh-6rem)/0.86)] w-full px-5 pb-12 [zoom:0.86] sm:min-h-[calc((100dvh-7rem)/0.86)] sm:px-6 sm:pb-16 lg:px-8">
          <div className="lg:grid lg:grid-cols-[232px_minmax(0,1fr)] lg:items-start lg:gap-8">
            <aside className="mb-5 lg:sticky lg:top-32 lg:mb-0">
              <AccountNav />
              <div className="mt-3 lg:hidden">
                <CustomerLogoutButton />
              </div>
            </aside>
            <div className="min-w-0">{children}</div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
