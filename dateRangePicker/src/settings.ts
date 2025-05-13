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
 * Date Range Picker General Settings Card
 */
class GeneralSettingsCard extends FormattingSettingsCard {
  buttonLabel = new formattingSettings.TextInput({
    name: "buttonLabel",
    displayName: "Button Label",
    value: "Select date range",
    placeholder: "Select date range"
  });

  placeholder = new formattingSettings.TextInput({
    name: "placeholder",
    displayName: "Placeholder Text",
    value: "Select date range",
    placeholder: "Select date range"
  });

  dateFormat = new formattingSettings.TextInput({
    name: "dateFormat",
    displayName: "Date Format",
    value: "LLL dd, y",
    placeholder: "LLL dd, y"
  });

  // Using TextInput as a workaround for NumUpDown type issues
  numberOfMonths = new formattingSettings.TextInput({
    name: "numberOfMonths",
    displayName: "Number of Months (1-3)",
    value: "2",
    placeholder: "Enter a number between 1 and 3"
  });

  name: string = "generalSettings";
  displayName: string = "General Settings";
  slices: Array<FormattingSettingsSlice> = [this.buttonLabel, this.placeholder, this.dateFormat, this.numberOfMonths];
}

/**
 * Style Settings Card
 */
class StyleSettingsCard extends FormattingSettingsCard {
  buttonVariant = new formattingSettings.ItemDropdown({
    name: "buttonVariant",
    displayName: "Button Style",
    value: { value: "outline", displayName: "Outline" },
    items: [
      { value: "default", displayName: "Default (Dark)" },
      { value: "outline", displayName: "Outline" }
    ]
  });

  primaryColor = new formattingSettings.ColorPicker({
    name: "primaryColor",
    displayName: "Primary Color",
    value: { value: "#0f172a" }
  });

  secondaryColor = new formattingSettings.ColorPicker({
    name: "secondaryColor",
    displayName: "Secondary Color",
    value: { value: "#e2e8f0" }
  });

  fontFamily = new formattingSettings.TextInput({
    name: "fontFamily",
    displayName: "Font Family",
    value: "Segoe UI, sans-serif",
    placeholder: "Segoe UI, sans-serif"
  });

  name: string = "styleSettings";
  displayName: string = "Style Settings";
  slices: Array<FormattingSettingsSlice> = [this.buttonVariant, this.primaryColor, this.secondaryColor, this.fontFamily];
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
  // Create formatting settings model cards
  generalSettings = new GeneralSettingsCard();
  styleSettings = new StyleSettingsCard();

  cards = [this.generalSettings, this.styleSettings];
}