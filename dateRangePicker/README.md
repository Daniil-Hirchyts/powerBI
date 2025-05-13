# Shadcn-inspired Date Range Picker for Power BI

A modern, responsive date range picker for Power BI using a design inspired by shadcn components. This visual allows users to select date ranges with a beautiful calendar interface that automatically filters data.

## Features

- **Modern UI**: Clean, contemporary design inspired by shadcn components
- **Automatic Filtering**: Immediately applies filters when dates are selected - no apply button needed
- **Fully Customizable**: Extensive formatting options for colors, text, and appearance
- **Responsive**: Works well on various screen sizes and in Power BI mobile
- **Calendar View**: Elegant popup calendar for easy date selection

## How to Use

1. Import the visual into your Power BI report
2. Add a date field to the "Date Field" data role
3. Click on the date range button to open the calendar
4. Select your date range and the visual will automatically filter your report

## Customization Options

### General Settings
- **Button Label**: Customize the text shown on the button
- **Placeholder Text**: The text shown when no date is selected
- **Date Format**: Control how dates appear (e.g., "LLL dd, y" shows as "Jan 01, 2023")
- **Number of Months**: Choose between 1-3 months to display in the calendar

### Style Settings
- **Button Style**: Choose between default (dark) or outline style
- **Primary Color**: Change the main color for selected dates and UI elements
- **Secondary Color**: Customize the color for date range highlighting
- **Font Family**: Set the font used throughout the component

## Development

This visual is built using:
- Power BI Visual Tools
- React
- react-day-picker
- date-fns for date formatting
- TypeScript

### Building and Running

```bash
# Install dependencies
npm install

# Start development server
npm start

# Package the visual
npm run package
```

The packaged visual (.pbiviz file) can be found in the `dist` directory.

## Requirements

- Power BI Desktop or Power BI Service
- A date field in your dataset to filter on 