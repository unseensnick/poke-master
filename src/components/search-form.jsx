import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

export function SearchForm({ ...props }) {
    return (
        <form {...props}>
            <div className="relative">
                <Label htmlFor="search" className="sr-only">
                    Search
                </Label>
                <Input
                    id="search"
                    placeholder="Search Pokémon..."
                    className="h-8 w-2xs pl-7 border-0 bg-accent-foreground/80 rounded-lg text-white/70 placeholder:text-white/70 placeholder:opacity-50 focus-visible:border focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
                />
                <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none text-unknown/50" />
            </div>
        </form>
    );
}
