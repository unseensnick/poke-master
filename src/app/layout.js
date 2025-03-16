import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { Fira_Sans } from "next/font/google";
import "./globals.css";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const firaSans = Fira_Sans({
    variable: "--font-fira-sans",
    subsets: ["latin"],
    weight: ["400", "500", "700"],
});

export const metadata = {
    title: "PokéMaster",
    description: "Pokémon website made with next.js, tailwind v4 and shadcn/ui",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${firaSans.variable} antialiased`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <div
                        style={{ "--header-height": "4rem" }}
                        className="flex flex-col min-h-screen"
                    >
                        <SidebarProvider
                            defaultOpen={false}
                            className="flex flex-col flex-1"
                        >
                            <SiteHeader />
                            <div className="flex flex-1 bg-background">
                                <SidebarInset>
                                    <main className="flex flex-1 flex-col p-4">
                                        {children}
                                    </main>
                                </SidebarInset>
                                <AppSidebar side="right" />
                            </div>
                        </SidebarProvider>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
