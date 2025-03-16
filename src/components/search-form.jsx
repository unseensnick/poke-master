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
                    className="h-9 w-[200px] lg:w-[250px] pl-8 rounded-full border-muted-foreground/30 bg-background/80 
                    text-foreground/80 placeholder:text-foreground/50 focus-visible:border-primary 
                    focus-visible:ring-1 focus-visible:ring-primary dark:bg-muted/30"
                />
                <Search
                    className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 
                select-none text-pokemon-unknown/50"
                />
            </div>
        </form>
    );
}
