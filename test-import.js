try {
  const analytics = require('@vercel/analytics/react');
  console.log('Import successful:', Object.keys(analytics));
} catch (e) {
  console.error('Import failed:', e.message);
}
