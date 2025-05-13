import * as React from 'react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { DayPicker, DateRange } from 'react-day-picker';
import * as ReactDOM from 'react-dom';
import 'react-day-picker/dist/style.css';

// Calendar icon component
function CalendarIcon() {
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

// Portal component to render content outside the component tree
function Portal({ children }: { children: React.ReactNode }) {
  const [container] = useState(() => document.createElement('div'));
  
  useEffect(() => {
    // Add the portal container to document body
    document.body.appendChild(container);
    // Set portal container styles to position it above everything
    container.style.position = 'absolute';
    container.style.zIndex = '10000';
    container.style.top = '0';
    container.style.left = '0';
    
    return () => {
      document.body.removeChild(container);
    };
  }, [container]);
  
  return ReactDOM.createPortal(children, container);
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  className = '',
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
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
  
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
    
    // Close the calendar if a complete range is selected
    if (range?.from && range?.to) {
      setTimeout(() => setIsCalendarOpen(false), 300);
    }
  };

  const buttonRef = React.useRef<HTMLButtonElement>(null);
  
  const toggleCalendar = () => {
    if (!isCalendarOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // Calculate position for calendar dropdown
      setCalendarPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX
      });
    }
    setIsCalendarOpen(!isCalendarOpen);
  };

  // Handle clicks outside of the calendar
  const calendarRef = React.useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && 
          !calendarRef.current.contains(event.target as Node) && 
          buttonRef.current && 
          !buttonRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`date-range-picker-container ${className}`} style={{ position: 'relative', width: '100%' }}>
      <button
        ref={buttonRef}
        onClick={toggleCalendar}
        className={`date-range-button ${buttonVariant === 'default' ? 'date-range-button-default' : 'date-range-button-outline'}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          padding: '8px 12px',
          borderRadius: '4px',
          border: buttonVariant === 'outline' ? '1px solid #e2e8f0' : 'none',
          background: buttonVariant === 'default' ? '#0f172a' : 'white',
          color: buttonVariant === 'default' ? 'white' : 'inherit',
          textAlign: 'left',
          cursor: 'pointer',
          fontSize: '14px',
          fontFamily: 'inherit'
        }}
      >
        <CalendarIcon />
        <span>{formattedDateRange}</span>
      </button>
      
      {isCalendarOpen && (
        <Portal>
          <div 
            ref={calendarRef}
            className="calendar-popover"
            style={{
              position: 'fixed',
              top: `${calendarPosition.top}px`,
              left: `${calendarPosition.left}px`,
              backgroundColor: 'white',
              borderRadius: '6px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0',
              zIndex: 10000
            }}
          >
            <DayPicker
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleRangeSelect}
              numberOfMonths={numberOfMonths}
              style={{ padding: '12px' }}
            />
          </div>
        </Portal>
      )}
    </div>
  );
}; 