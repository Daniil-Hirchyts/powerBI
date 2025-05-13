# Date Range Picker for Power BI

A custom Power BI visual that provides a date range picker with calendar view, allowing users to select date ranges for filtering data.

## Features

- Calendar view for date selection
- Start and end date pickers
- Configurable labels and button text
- Automatically filters data based on selected date range
- Clean, modern UI that follows Power BI design guidelines

## How to Use

1. Import the visual into your Power BI report
2. Add a date field to the "Date Field" data role
3. Configure appearance using the formatting options:
   - Start Date Label
   - End Date Label
   - Apply Button Text
4. Select dates using the calendar, then click Apply to filter your report

## Development

This visual is built using:
- Power BI Visual Tools
- React
- react-datepicker
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

## Requirements

- Power BI Desktop or Power BI Service
- A date field in your dataset to filter on 