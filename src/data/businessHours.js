export const businessHours = {
    0: { timeRanges: [{openTime: "0000", closeTime: "0100"}, {openTime: "0110", closeTime: "0200"}], timezone: "ET" }, // Sunday duplicate for easy access
    1: { timeRanges: [{openTime: "0000", closeTime: "2300"}], timezone: "ET" }, // Monday
    2: { timeRanges: [{openTime: "0000", closeTime: "2300"}], timezone: "ET" }, // Tuesday
    3: { timeRanges: [{openTime: "0000", closeTime: "2300"}], timezone: "ET" }, // Wednesday
    4: { timeRanges: [{openTime: "0000", closeTime: "2300"}], timezone: "ET" }, // Thursday
    5: { timeRanges: [{openTime: "1000", closeTime: "2200"}], timezone: "ET" }, // Friday
    // all xxxx for closed
    6: { timeRanges: [{openTime: "xxxx", closeTime: "xxxx"}], timezone: "ET" }, // Saturday
    7: { timeRanges: [{openTime: "0000", closeTime: "0100"}, {openTime: "0110", closeTime: "0200"}], timezone: "ET" }, // Sunday
}