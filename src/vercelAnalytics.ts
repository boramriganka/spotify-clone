// Workaround for react-scripts 3.4.1 which doesn't support conditional exports
const analyticsModule = require('@vercel/analytics/dist/react/index.js');
export const Analytics = analyticsModule.Analytics;
export const track = analyticsModule.track;
