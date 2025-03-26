"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SORT_OPTIONS } from "@/lib/pokemon-constants";
import { ArrowDownAZ, ArrowDownUp, ArrowUpAZ, ArrowUpDown } from "lucide-react";

/**
 * Icons for each sort option
 */
const SORT_ICONS = {
    "id-asc": ArrowUpDown,
    "id-desc": ArrowDownUp,
    "name-asc": ArrowDownAZ,
    "name-desc": ArrowUpAZ,
};

/**
 * Dropdown for selecting Pokemon sort order
 *
 * @param {Object} props - Component props
 * @param {string} props.value - Current sort option
 * @param {Function} props.onChange - Called when selection changes
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Sort dropdown component
 */
export function PokemonSort({ value = "id-asc", onChange, className = "" }) {
    // Get icon component for current sort option
    const getIcon = () => {
        const Icon = SORT_ICONS[value] || ArrowUpDown;
        return <Icon className="h-4 w-4 mr-2" />;
    };

    return (
        <div className={className}>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    {SORT_OPTIONS.map((option) => {
                        const Icon = SORT_ICONS[option.value] || ArrowUpDown;
                        return (
                            <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center">
                                    <Icon className="h-4 w-4 mr-2" />
                                    <span>{option.label}</span>
                                </div>
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>
        </div>
    );
}
