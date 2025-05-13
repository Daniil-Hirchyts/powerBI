/*
 *  Power BI Visualizations
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

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import { IFilterColumnTarget } from "powerbi-models";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

/**
 * Date Range Settings Card
 */
class DateRangeSettingsCard extends FormattingSettingsCard {
    startDateLabel = new formattingSettings.TextInput({
        name: "startDateLabel",
        displayName: "Start Date Label",
        value: "Start Date",
        placeholder: "Start Date"
    });

    endDateLabel = new formattingSettings.TextInput({
        name: "endDateLabel",
        displayName: "End Date Label",
        value: "End Date",
        placeholder: "End Date"
    });

    applyButtonText = new formattingSettings.TextInput({
        name: "applyButtonText",
        displayName: "Apply Button Text",
        value: "Apply",
        placeholder: "Apply"
    });

    name: string = "dateRangeSettings";
    displayName: string = "Date Range Settings";
    slices: Array<FormattingSettingsSlice> = [this.startDateLabel, this.endDateLabel, this.applyButtonText];
}

export interface FilterTarget {
    table: string;
    column: string;
    ref: string;
}

/**
 * Visual settings model class
 */
export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    // Create formatting settings model formatting cards
    dateRangeSettings = new DateRangeSettingsCard();

    cards = [this.dateRangeSettings];
}