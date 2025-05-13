import * as React from 'react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { DayPicker, DateRange } from 'react-day-picker';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '../utils';

// Calendar icon component
function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 mr-2"
      {...props}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

interface DateRangePickerProps {
  className?: string;
  buttonLabel?: string;
  placeholder?: string;
  numberOfMonths?: number;
  onRangeChange: (from: Date | undefined, to: Date | undefined) => void;
  initialDateRange?: DateRange;
  dateFormat?: string;
  buttonVariant?: 'default' | 'outline';
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  className,
  buttonLabel = 'Select date range',
  placeholder = 'Select date range',
  numberOfMonths = 2,
  onRangeChange,
  initialDateRange,
  dateFormat = 'LLL dd, y',
  buttonVariant = 'outline'
}) => {
  // State for the selected date range
  const [dateRange, setDateRange] = useState<DateRange | undefined>(initialDateRange);

  // Format the date range for display
  const formattedDateRange = React.useMemo(() => {
    if (!dateRange?.from) {
      return placeholder;
    }
    if (dateRange.to) {
      return `${format(dateRange.from, dateFormat)} - ${format(dateRange.to, dateFormat)}`;
    }
    return format(dateRange.from, dateFormat);
  }, [dateRange, dateFormat, placeholder]);

  // Apply filter automatically when the date range changes
  useEffect(() => {
    if (dateRange?.from) {
      onRangeChange(dateRange.from, dateRange.to || dateRange.from);
    } else {
      onRangeChange(undefined, undefined);
    }
  }, [dateRange, onRangeChange]);

  const handleRangeSelect = (range: DateRange | undefined) => {
    console.log("Selected range:", range);
    setDateRange(range);
  };

  return (
    <div className={cn("date-range-picker-container w-full", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={buttonVariant}
            className="w-full justify-start font-normal text-left"
          >
            <CalendarIcon />
            <span>{formattedDateRange}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <DayPicker
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={handleRangeSelect}
            numberOfMonths={numberOfMonths}
            className="p-3"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}; 