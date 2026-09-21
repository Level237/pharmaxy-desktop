import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#F0F5FA] font-sans overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 ml-[260px] min-w-0 flex flex-col max-w-[calc(100vw-260px)]">
        <Header />
        <div className="flex-1 p-6 md:p-8 overflow-y-auto overflow-x-hidden min-w-0">
          {children}
        </div>
      </main>
    </div>
  );
}
