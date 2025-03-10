import { SiteHeader } from "@/components/site-header";
import { Fira_Sans } from "next/font/google";
import "./globals.css";

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
        <html lang="en">
            <body className={`${firaSans.variable}  antialiased`}>
                <SiteHeader />
                {children}
            </body>
        </html>
    );
}
