import * as React from 'react';
import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DateRangePickerProps {
    startDateLabel: string;
    endDateLabel: string;
    applyButtonText: string;
    onApply: (startDate: Date, endDate: Date) => void;
    className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
    startDateLabel,
    endDateLabel,
    applyButtonText,
    onApply,
    className = ''
}) => {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // For debugging - verify component is mounting
        console.log("DateRangePicker component mounted");
        return () => console.log("DateRangePicker component unmounted");
    }, []);

    const handleStartDateChange = (date: Date) => {
        try {
            setStartDate(date);
            // If end date is earlier than the new start date, update it
            if (endDate && date > endDate) {
                setEndDate(date);
            }
        } catch (e) {
            console.error("Error in handleStartDateChange:", e);
            setError(e.message);
        }
    };

    const handleEndDateChange = (date: Date) => {
        try {
            setEndDate(date);
        } catch (e) {
            console.error("Error in handleEndDateChange:", e);
            setError(e.message);
        }
    };

    const handleApplyClick = () => {
        try {
            if (startDate && endDate) {
                onApply(startDate, endDate);
            }
        } catch (e) {
            console.error("Error in handleApplyClick:", e);
            setError(e.message);
        }
    };

    if (error) {
        return (
            <div style={{ padding: '10px', color: 'red', border: '1px solid red', borderRadius: '4px' }}>
                Error: {error}
            </div>
        );
    }

    return (
        <div className={`date-range-picker ${className}`}>
            <div className="date-picker-container">
                <div className="date-field">
                    <label>{startDateLabel}</label>
                    <DatePicker
                        selected={startDate}
                        onChange={handleStartDateChange}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Select start date"
                        calendarClassName="date-picker-calendar"
                    />
                </div>
                
                <div className="date-field">
                    <label>{endDateLabel}</label>
                    <DatePicker
                        selected={endDate}
                        onChange={handleEndDateChange}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Select end date"
                        calendarClassName="date-picker-calendar"
                    />
                </div>
            </div>
            
            <button 
                className="apply-button"
                onClick={handleApplyClick}
                disabled={!startDate || !endDate}
            >
                {applyButtonText}
            </button>
        </div>
    );
}; 