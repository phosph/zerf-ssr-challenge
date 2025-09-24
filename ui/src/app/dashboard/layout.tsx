import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SideMenu } from "./SideMenu";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider>
            <SideMenu />
            <main className="w-full bg-[#F7F7F7] pt-4 p-6">
                <SidebarTrigger />
                {children}
            </main>
        </SidebarProvider>
    );
}
