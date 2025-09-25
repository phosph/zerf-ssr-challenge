import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DashboardFilters } from "@/hooks/use-realtime-stats";
import { Close, Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { endOfDay, endOfWeek, endOfYear, isSunday, parseISO, previousSunday, startOfDay, startOfWeek, startOfYear, subDays, subWeeks, subYears } from 'date-fns';
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";

export function StatsFilter({ onFilterChange, currentFilters }: { onFilterChange: (filters: DashboardFilters | null) => void, currentFilters?: DashboardFilters | null }) {

    return (
        <div className="flex gap-3 items-center">
            <Popover>
                <PopoverTrigger asChild>
                    <Button type="button">
                        <CalendarIcon />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="z-50">
                    <StatsFilterPopover onFilterChange={onFilterChange} currentFilters={currentFilters} />
                </PopoverContent>
            </Popover>
            <p className="leading-none align-middle text-[#2F363C] font-medium text-base">Last 7 Days:</p>
            <p className="leading-none align-middle text-[#2F363C] text-sm">Jul 22 - Jul 27, 2025</p>
        </div>
    )
}

const predefinedFilterOptioons = [
    {
        label: "Today",
        value: (): DateRange => {
            const now = new Date()
            return { from: startOfDay(now), to: endOfDay(now) }
        }
    },
    {
        label: "This Week (Sun - Today)",
        value: (): DateRange => {
            const now = new Date()
            return { from: isSunday(now) ? startOfDay(now) : previousSunday(now), to: endOfDay(now) }
        }
    },
    {
        label: "Last Week (Sun - Sat)",
        value: (): DateRange => {
            const lastWeek = subWeeks(new Date(), 1)
            return { from: startOfWeek(lastWeek), to: endOfWeek(lastWeek) }
        }
    },
    {
        label: "Last 7 Days",
        value: (): DateRange => {
            const now = new Date()
            return { from: subDays(now, 7), to: endOfDay(now) }
        }
    },
    {
        label: "Last 30 Days",
        value: (): DateRange => {
            const now = new Date()
            return { from: subDays(now, 30), to: endOfDay(now) }
        }
    },
    {
        label: "Last 90 Days",
        value: (): DateRange => {
            const now = new Date()
            return { from: subDays(now, 90), to: endOfDay(now) }
        }
    },
    {
        label: "Last 12 Months",
        value: (): DateRange => {
            const now = new Date()
            return { from: subYears(now, 1), to: endOfDay(now) }
        }
    },
    {
        label: "Last Calendar Year",
        value: (): DateRange => {
            const lastYear = subYears(new Date(), 1)
            return { from: startOfYear(lastYear), to: endOfYear(lastYear) }
        }
    },

]

function StatsFilterPopover({ onFilterChange, currentFilters }: { onFilterChange: (filters: DashboardFilters | null) => void, currentFilters?: DashboardFilters | null }) {
    const [dateRange, setDateRange] = useState<DateRange | undefined>(
        () => {
            if (!currentFilters) return predefinedFilterOptioons[4].value();

            return {
                from: parseISO(currentFilters.startDate),
                to: currentFilters.endDate ? parseISO(currentFilters.endDate) : endOfDay(new Date())
            }
        }
    )

    return (
        <div className="card">
            <div className="flex">
                <div className="border-r pt-4">
                    <ul className="flex flex-col gap-1">
                        {predefinedFilterOptioons.map((option, index) => (
                            <li key={index}>
                                <Button type="button" variant="ghost" className="flex w-full justify-start" onClick={() => setDateRange(option.value())}>
                                    {option.label}
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
                <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                />
            </div>
            <div className="border-t flex justify-end gap-2.5 py-2 px-4">
                <Close asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </Close>
                <Close asChild disabled={!dateRange}
                    onClick={() => onFilterChange({ startDate: dateRange!.from!.toISOString(), endDate: dateRange!.to?.toISOString() })}
                >
                    <Button type="button" variant="default">Apply</Button>
                </Close>
            </div>
        </div>
    )
}

