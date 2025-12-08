# Update Log

## 2025-12-04

### e:\work\eatifyPos\src\pages\inStore_shop_cart.js

#### Function: calculateTotalPrice (Modified)
- **Location**: ~Line 470
- **Change**: Updated calculation logic to explicitly check `isTaxExempt` state.
- **Reason**: Fix tax persistence issue. When new items are added, if `isTaxExempt` is true, tax is now correctly calculated as 0, instead of relying on a fixed discount amount.

#### Function: applyCustomPrice (Modified)
- **Location**: ~Line 1373
- **Change**: Refactored to separate "Tax Exempt" logic from "Discount/Surcharge" logic.
- **Reason**: Improve clarity and fix "Discount value display error". Now `discount` state only holds manual discounts, not tax exemption amounts.

#### Function: handleCustomPriceClick (Modified)
- **Location**: ~Line 1317
- **Change**: Updated logic to calculate the current target price based on the new `isTaxExempt` and `discount` separation.
- **Reason**: Ensure the "Adjust Total" modal shows the correct current total.

#### JSX: Tax Exempt Button (Modified)
- **Location**: ~Line 1900
- **Change**: Button now only toggles `isTaxExempt` state, without modifying `discount`.
- **Reason**: Decouple tax status from discount value.

#### JSX: Tax Display (Modified)
- **Location**: ~Line 1897
- **Change**: Updated to show $0.00 if `isTaxExempt` is true.
- **Reason**: Visual consistency with new logic.

#### Function: MarkAsUnPaid (Modified)
- **Location**: ~Line 968
- **Change**: Updated `tax` and `originalTotal` calculation in the payment intent metadata to respect `isTaxExempt`.
- **Reason**: Ensure backend records correct tax amount.

#### Function Calls: CashCheckOut (Modified)
- **Location**: ~Lines 2388, 2408
- **Change**: Passed correct tax amount (0 if exempt) to `CashCheckOut`.
- **Reason**: Ensure cash checkout records correct tax.

### e:\work\eatifyPos\src\components\Member\translations.js

#### Variable: memberTranslations (Modified)
- **Location**: ~Line 194
- **Change**: Added "Before Consumption Balance" ("消费前余额") and "After Consumption Balance" ("消费后余额") translation keys.
- **Reason**: To support distinct headers for Consumption Records table.

### e:\work\eatifyPos\src\components\Member\MemberList.js

#### Component: Records Modal (Modified)
- **Location**: ~Line 852
- **Change**: Updated Consumption Records table header to use `t('Before Consumption Balance')` and `t('After Consumption Balance')`.
- **Reason**: To display "消费前余额" and "消费后余额" in the Consumption Records table instead of "充值前余额" and "充值后余额".

## 2025-12-05

### e:\work\eatifyPos\src\components\Account_admin.js

#### Function: renderLegend (Modified)
- **Location**: ~Line 5137
- **Change**: Refactored layout from flex-row with translateX to flex-column with left padding. Removed column splitting logic to display a single vertical list.
- **Reason**: To align with the new UI design (Figure 2) where the legend is displayed as a vertical list above/left of the chart.

#### Component: PieChart (Modified)
- **Location**: ~Line 4415
- **Change**: 
    1. Changed `Pie` `cx` prop from `80` to `"50%"` to center the chart horizontally.
    2. Updated `Legend` props to `layout="vertical"`, `align="left"`, `verticalAlign="top"` and removed conditional mobile rendering difference.
    3. Increased `PieChart` height from `380` to `500` and set `Pie` `cy` to `300`.
- **Reason**: To fix layout overlap between the vertical legend and the pie chart by increasing container height and pushing the pie chart downwards.

#### Component: PieChart (Refactored)
- **Location**: ~Line 4412-4594
- **Change**:
    1. Replaced redundant data processing (6 reduce calls) with a single aggregated calculation.
    2. Defined local `CHART_COLORS` constant to fix undefined error.
    3. Centered Pie chart (`cx="50%"`, `cy="50%"`).
    4. Reduced `PieChart` height to `200px` to reduce blank space.
    5. Integrated custom legend directly into the component.
- **Reason**: To fix incomplete chart display, improve performance, resolve undefined variable errors, and reduce excessive blank space.

#### JSX: Main Container (Modified)
- **Location**: ~Line 3400
- **Change**: Added `px-2` class to `card-body tab-content`.
- **Reason**: To reduce the page margin/padding by half as requested.
