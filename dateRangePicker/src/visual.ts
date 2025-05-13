/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";
import "../style/dateRangePicker.css";
import "../style/shadcn.css";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { DateRangePicker } from "./components/DateRangePicker";
import { 
    VisualFormattingSettingsModel, 
    FilterTarget 
} from "./settings";
import { DateRange } from "react-day-picker";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import DataView = powerbi.DataView;
import IViewport = powerbi.IViewport;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;

// Power BI Advanced Filter related imports
import { AdvancedFilter, IAdvancedFilterCondition, IFilterColumnTarget } from "powerbi-models";

export class Visual implements IVisual {
    private target: HTMLElement;
    private reactRoot: HTMLElement;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;
    private host: IVisualHost;
    private filterTarget: IFilterColumnTarget | undefined;
    private initialDateRange: DateRange | undefined;

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
        this.host = options.host;
        this.formattingSettingsService = new FormattingSettingsService();
        
        // Create a container for the React component
        this.reactRoot = document.createElement("div");
        this.reactRoot.className = "date-range-picker-wrapper";
        
        // Ensure the container is visible
        this.reactRoot.style.width = "100%";
        this.reactRoot.style.height = "100%";
        this.reactRoot.style.minHeight = "200px";
        this.reactRoot.style.backgroundColor = "white";
        this.reactRoot.style.overflow = "auto";
        
        // Add styles for the shadcn components
        const style = document.createElement("style");
        style.textContent = `
            .date-range-picker-wrapper {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 12px;
            }
            .date-range-picker-container {
                width: 100%;
                max-width: 400px;
            }
        `;
        document.head.appendChild(style);
        
        // Add the React container to the visual container
        this.target.appendChild(this.reactRoot);
        
        console.log("Visual constructor completed");
    }

    public update(options: VisualUpdateOptions) {
        try {
            if (!options || !options.dataViews || !options.dataViews[0]) {
                console.log("No data view available");
                // Render empty state with message
                if (this.reactRoot) {
                    this.reactRoot.innerHTML = "<div style='padding: 10px; color: #888; text-align: center;'>Please add a date field to visualize</div>";
                }
                return;
            }

            this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(
                VisualFormattingSettingsModel, 
                options.dataViews[0]
            );

            // Extract filter target for the date field
            this.updateFilterTarget(options.dataViews);
            
            // Log any issues with the filter target
            console.log("Filter target:", this.filterTarget);
            
            // Render the React component with current settings
            this.renderReactComponent();
        } catch (error) {
            console.error("Error in update method:", error);
            if (this.reactRoot) {
                this.reactRoot.innerHTML = `<div style='padding: 10px; color: red;'>Error: ${error.message}</div>`;
            }
        }
    }

    private updateFilterTarget(dataViews: DataView[]): void {
        try {
            if (!dataViews || !dataViews[0]) {
                console.log("No dataViews available");
                this.filterTarget = undefined;
                return;
            }
            
            if (!dataViews[0].categorical) {
                console.log("No categorical data available");
                this.filterTarget = undefined;
                return;
            }
            
            if (!dataViews[0].categorical.categories || !dataViews[0].categorical.categories[0]) {
                console.log("No categories available in categorical data");
                this.filterTarget = undefined;
                return;
            }

            const categorySource = dataViews[0].categorical.categories[0].source;
            console.log("Category source:", categorySource);
            
            // Check if queryName contains a dot
            if (categorySource.queryName.indexOf('.') === -1) {
                console.log("QueryName doesn't contain table name:", categorySource.queryName);
                this.filterTarget = {
                    table: "Query", // Default table name if not found
                    column: categorySource.displayName
                };
            } else {
                this.filterTarget = {
                    table: categorySource.queryName.substr(0, categorySource.queryName.indexOf('.')),
                    column: categorySource.displayName
                };
            }
            
            console.log("Set filter target to:", this.filterTarget);
        } catch (error) {
            console.error("Error in updateFilterTarget:", error);
            this.filterTarget = undefined;
        }
    }

    private renderReactComponent(): void {
        try {
            if (!this.reactRoot) {
                console.error("React root element not found");
                return;
            }

            // Ensure the root element is visible and sized correctly
            this.reactRoot.style.width = "100%";
            this.reactRoot.style.height = "100%";
            this.reactRoot.style.overflow = "auto";
            
            // Get settings from formatting options
            const { generalSettings, styleSettings } = this.formattingSettings;

            // Apply custom CSS for colors
            const customStyle = document.createElement('style');
            customStyle.textContent = `
                .rdp-day_selected, .rdp-day_range_start, .rdp-day_range_end {
                    background-color: ${styleSettings.primaryColor.value.value} !important;
                }
                .rdp-day_range_middle {
                    background-color: ${styleSettings.secondaryColor.value.value} !important;
                    color: ${styleSettings.primaryColor.value.value} !important;
                }
                .date-range-picker-container {
                    font-family: ${styleSettings.fontFamily.value};
                }
            `;
            document.head.appendChild(customStyle);

            console.log("Rendering with settings:", { generalSettings, styleSettings });

            try {
                const reactElement = React.createElement(DateRangePicker, {
                    buttonLabel: generalSettings.buttonLabel.value,
                    placeholder: generalSettings.placeholder.value,
                    dateFormat: generalSettings.dateFormat.value,
                    numberOfMonths: parseInt(generalSettings.numberOfMonths.value, 10) || 2,
                    buttonVariant: (styleSettings.buttonVariant.value.value as string) as 'default' | 'outline',
                    initialDateRange: this.initialDateRange,
                    onRangeChange: this.handleDateRangeChange.bind(this)
                });

                // Use compatible rendering method
                // React 17 or older render method for PowerBI compatibility
                // @ts-ignore
                ReactDOM.render(reactElement, this.reactRoot);
                
                console.log("React component rendered successfully");
            } catch (reactError) {
                console.error("Error in React rendering:", reactError);
                
                // Display error message if component fails to render
                this.reactRoot.innerHTML = `
                    <div style="padding: 20px; border: 1px solid #f0f0f0; border-radius: 4px; background: white;">
                        <h3 style="margin-top: 0; color: #333;">Date Range Picker</h3>
                        <p style="color: #666;">Error rendering component: ${reactError.message}</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error("Error rendering component:", error);
            if (this.reactRoot) {
                this.reactRoot.innerHTML = `<div style='padding: 10px; color: red;'>Rendering Error: ${error.message}</div>`;
            }
        }
    }

    private handleDateRangeChange(startDate: Date | undefined, endDate: Date | undefined): void {
        if (!this.filterTarget) {
            console.log("Filter target is not available");
            return;
        }

        try {
            // Store the selected date range for persistence
            if (startDate && endDate) {
                this.initialDateRange = {
                    from: startDate,
                    to: endDate
                };
            } else {
                this.initialDateRange = undefined;
            }

            // If no dates are selected, clear the filter
            if (!startDate || !endDate) {
                this.host.applyJsonFilter(null, "general", "filter", powerbi.FilterAction.remove);
                console.log("Filter cleared");
                return;
            }

            // Create filter conditions
            const conditions: IAdvancedFilterCondition[] = [
                {
                    operator: "GreaterThanOrEqual",
                    value: startDate.toISOString()
                },
                {
                    operator: "LessThanOrEqual",
                    value: endDate.toISOString()
                }
            ];

            // Create the Advanced Filter 
            const filter = new AdvancedFilter(
                this.filterTarget,
                "And",
                conditions
            );

            // Apply the filter to the visual
            this.host.applyJsonFilter(filter, "general", "filter", powerbi.FilterAction.merge);
            console.log("Applied filter:", filter);
        } catch (error) {
            console.error("Error applying filter:", error);
        }
    }

    /**
     * Returns properties pane formatting model content hierarchies, properties and latest formatting values.
     */
    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}