import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, X, Download } from 'lucide-react';
import { format, subDays, subMonths, subYears } from 'date-fns';
import { cn } from '@/lib/utils';

export type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

export type PresetRange = 'all' | '7days' | '30days' | '90days' | '6months' | '1year' | 'custom';

interface AnalyticsDateFilterProps {
  dateRange: DateRange;
  presetRange: PresetRange;
  onPresetChange: (preset: PresetRange) => void;
  onDateSelect: (range: DateRange | undefined) => void;
  onClear: () => void;
  onExport?: () => void;
}

const PRESETS: { key: PresetRange; label: string }[] = [
  { key: '7days', label: 'Last 7 days' },
  { key: '30days', label: 'Last 30 days' },
  { key: '90days', label: 'Last 90 days' },
  { key: '6months', label: 'Last 6 months' },
  { key: '1year', label: 'Last year' },
];

export function getDateRangeForPreset(preset: PresetRange): DateRange {
  const today = new Date();
  switch (preset) {
    case '7days': return { from: subDays(today, 7), to: today };
    case '30days': return { from: subDays(today, 30), to: today };
    case '90days': return { from: subDays(today, 90), to: today };
    case '6months': return { from: subMonths(today, 6), to: today };
    case '1year': return { from: subYears(today, 1), to: today };
    case 'all': return { from: undefined, to: undefined };
    default: return { from: undefined, to: undefined };
  }
}

export function AnalyticsDateFilter({
  dateRange,
  presetRange,
  onPresetChange,
  onDateSelect,
  onClear,
  onExport,
}: AnalyticsDateFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 bg-card rounded-xl border p-3">
      <span className="text-sm font-medium text-muted-foreground">Date Range:</span>
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((preset) => (
          <Button
            key={preset.key}
            variant={presetRange === preset.key ? 'default' : 'outline'}
            size="sm"
            className="h-8 text-xs"
            onClick={() => onPresetChange(preset.key)}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={presetRange === 'custom' ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'h-8 justify-start text-left font-normal text-xs',
              !dateRange.from && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
            {dateRange.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, 'MMM d, yyyy')} - {format(dateRange.to, 'MMM d, yyyy')}
                </>
              ) : (
                format(dateRange.from, 'MMM d, yyyy')
              )
            ) : (
              'Pick dates'
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange.from}
            selected={dateRange}
            onSelect={onDateSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      {(dateRange.from || dateRange.to) && (
        <Button variant="ghost" size="sm" onClick={onClear} className="h-8 px-2">
          <X className="h-3.5 w-3.5" />
        </Button>
      )}

      {onExport && (
        <Button variant="outline" size="sm" onClick={onExport} className="h-8 ml-auto gap-1.5 text-xs">
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
      )}
    </div>
  );
}
