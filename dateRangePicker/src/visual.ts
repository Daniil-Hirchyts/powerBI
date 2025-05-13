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
import * as React from "react";
import * as ReactDOM from "react-dom";
import { DateRangePicker } from "./components/DateRangePicker";
import { 
    VisualFormattingSettingsModel, 
    FilterTarget 
} from "./settings";

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
        
        // Force styles to be visible
        const style = document.createElement("style");
        style.textContent = `
            .date-range-picker {
                font-family: "Segoe UI", -apple-system, sans-serif;
                padding: 12px;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                background-color: white;
                border-radius: 4px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                min-height: 150px;
            }
            .date-picker-container {
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin-bottom: 16px;
            }
            .date-field {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            .date-field label {
                font-size: 12px;
                font-weight: 600;
                color: #252423;
            }
            .apply-button {
                background-color: #0078d4;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 8px 16px;
                font-size: 14px;
                cursor: pointer;
                height: 36px;
                align-self: flex-end;
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
            const startDateLabel = this.formattingSettings.dateRangeSettings.startDateLabel.value || "Start Date";
            const endDateLabel = this.formattingSettings.dateRangeSettings.endDateLabel.value || "End Date";
            const applyButtonText = this.formattingSettings.dateRangeSettings.applyButtonText.value || "Apply";

            console.log("Rendering with settings:", { startDateLabel, endDateLabel, applyButtonText });

            // Create a simple fallback UI if ReactDOM or DateRangePicker fails
            try {
                const reactElement = React.createElement(DateRangePicker, {
                    startDateLabel: startDateLabel,
                    endDateLabel: endDateLabel,
                    applyButtonText: applyButtonText,
                    onApply: this.handleDateRangeApply.bind(this)
                });

                // Use the legacy render method for compatibility with PowerBI visuals API
                // @ts-ignore
                ReactDOM.render(reactElement, this.reactRoot);
                console.log("React component rendered successfully");
            } catch (reactError) {
                console.error("Error in React rendering:", reactError);
                
                // Create a fallback HTML structure
                this.reactRoot.innerHTML = `
                    <div class="date-range-picker">
                        <div class="date-picker-container">
                            <div class="date-field">
                                <label>${startDateLabel}</label>
                                <input type="date" id="startDate" class="fallback-date-input" />
                            </div>
                            
                            <div class="date-field">
                                <label>${endDateLabel}</label>
                                <input type="date" id="endDate" class="fallback-date-input" />
                            </div>
                        </div>
                        
                        <button class="apply-button" id="applyButton">${applyButtonText}</button>
                    </div>
                `;
                
                // Add event listeners to the fallback HTML
                const applyButton = this.reactRoot.querySelector('#applyButton');
                const startDateInput = this.reactRoot.querySelector('#startDate') as HTMLInputElement;
                const endDateInput = this.reactRoot.querySelector('#endDate') as HTMLInputElement;
                
                if (applyButton && startDateInput && endDateInput) {
                    applyButton.addEventListener('click', () => {
                        const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
                        const endDate = endDateInput.value ? new Date(endDateInput.value) : null;
                        
                        if (startDate && endDate) {
                            this.handleDateRangeApply(startDate, endDate);
                        }
                    });
                }
                
                console.log("Fallback HTML rendered successfully");
            }
        } catch (error) {
            console.error("Error rendering component:", error);
            if (this.reactRoot) {
                this.reactRoot.innerHTML = `<div style='padding: 10px; color: red;'>Rendering Error: ${error.message}</div>`;
            }
        }
    }

    private handleDateRangeApply(startDate: Date, endDate: Date): void {
        if (!this.filterTarget) return;

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
    }

    /**
     * Returns properties pane formatting model content hierarchies, properties and latest formatting values.
     */
    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}