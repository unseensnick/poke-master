import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { Fira_Sans } from "next/font/google";
import "./globals.css";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// Load Fira Sans with specific weights for optimal performance
const firaSans = Fira_Sans({
    variable: "--font-fira-sans",
    subsets: ["latin"],
    weight: ["400", "500", "700"],
});

// App metadata for search engines and social sharing
export const metadata = {
    title: "PokéMaster | Modern Pokémon Explorer",
    description:
        "Explore Pokémon data, build custom teams, and simulate battles with this interactive web application",
    keywords: "Pokémon, Pokédex, team builder, battle simulator, Next.js",
    openGraph: {
        title: "PokéMaster | Modern Pokémon Explorer",
        description:
            "Explore Pokémon data, build custom teams, and simulate battles",
        url:
            process.env.NEXT_PUBLIC_SITE_URL ||
            "https://pokemaster.example.com",
        siteName: "PokéMaster",
        type: "website",
    },
};

/**
 * Root layout component defining the application structure
 * Establishes theme support, font loading, and responsive sidebar layout
 */
export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${firaSans.variable} antialiased`}>
                {/* Theme provider wrapper */}
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {/* Main layout container with fixed header height */}
                    <div
                        style={{ "--header-height": "4rem" }}
                        className="flex flex-col min-h-screen"
                    >
                        {/* Sidebar provider for responsive layout */}
                        <SidebarProvider
                            defaultOpen={false}
                            className="flex flex-col flex-1"
                        >
                            {/* Fixed site header */}
                            <SiteHeader />

                            {/* Content area with sidebar */}
                            <div className="flex flex-1 bg-background">
                                {/* Main content area */}
                                <SidebarInset>
                                    <main className="flex flex-1 flex-col">
                                        {children}
                                    </main>
                                </SidebarInset>

                                {/* Right sidebar */}
                                <AppSidebar side="right" />
                            </div>
                        </SidebarProvider>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
