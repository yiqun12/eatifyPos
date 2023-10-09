import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';


import BusinessHoursTable from './BusinessHoursTable.js'

const BusinessHoursTestPage = () => {

  // if there is a new store, use the default open time
  const default_Open_time = JSON.parse(`{"0":{"timeRanges":[{"openTime":"0000","closeTime":"0100"},{"openTime":"0200","closeTime":"0300"}],"timezone":"ET"},"1":{"timeRanges":[{"openTime":"0000","closeTime":"0100"},{"openTime":"0200","closeTime":"0300"}],"timezone":"ET"},"2":{"timeRanges":[{"openTime":"0000","closeTime":"0100"},{"openTime":"0200","closeTime":"0300"}],"timezone":"ET"},"3":{"timeRanges":[{"openTime":"0000","closeTime":"0100"},{"openTime":"0200","closeTime":"0300"}],"timezone":"ET"},"4":{"timeRanges":[{"openTime":"0000","closeTime":"0100"},{"openTime":"0200","closeTime":"0300"}],"timezone":"ET"},"5":{"timeRanges":[{"openTime":"0000","closeTime":"0100"},{"openTime":"0200","closeTime":"0300"}],"timezone":"ET"},"6":{"timeRanges":[{"openTime":"0000","closeTime":"0020"},{"openTime":"0200","closeTime":"0300"}],"timezone":"ET"},"7":{"timeRanges":[{"openTime":"0000","closeTime":"0100"},{"openTime":"0200","closeTime":"0300"}],"timezone":"ET"}}`);
  const store = "Tony's Ice Cream Shop"
  const isOpen = "Open"

  return (
    <div>
      <BusinessHoursTable storeOpenTime={default_Open_time}></BusinessHoursTable>
    </div>
  );
}

export default BusinessHoursTestPage;