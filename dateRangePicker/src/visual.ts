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
        this.target.appendChild(this.reactRoot);
    }

    public update(options: VisualUpdateOptions) {
        this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(
            VisualFormattingSettingsModel, 
            options.dataViews[0]
        );

        // Extract filter target for the date field
        this.updateFilterTarget(options.dataViews);
        
        // Render the React component with current settings
        this.renderReactComponent();
    }

    private updateFilterTarget(dataViews: DataView[]): void {
        if (!dataViews || !dataViews[0] || !dataViews[0].categorical || !dataViews[0].categorical.categories || !dataViews[0].categorical.categories[0]) {
            this.filterTarget = undefined;
            return;
        }

        const categorySource = dataViews[0].categorical.categories[0].source;
        
        this.filterTarget = {
            table: categorySource.queryName.substr(0, categorySource.queryName.indexOf('.')),
            column: categorySource.displayName
        };
    }

    private renderReactComponent(): void {
        if (!this.reactRoot) return;

        // Get settings from formatting options
        const startDateLabel = this.formattingSettings.dateRangeSettings.startDateLabel.value || "Start Date";
        const endDateLabel = this.formattingSettings.dateRangeSettings.endDateLabel.value || "End Date";
        const applyButtonText = this.formattingSettings.dateRangeSettings.applyButtonText.value || "Apply";

        const reactElement = React.createElement(DateRangePicker, {
            startDateLabel: startDateLabel,
            endDateLabel: endDateLabel,
            applyButtonText: applyButtonText,
            onApply: this.handleDateRangeApply.bind(this)
        });

        // Use the legacy render method for compatibility with PowerBI visuals API
        // @ts-ignore
        ReactDOM.render(reactElement, this.reactRoot);
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