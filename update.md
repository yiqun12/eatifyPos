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
