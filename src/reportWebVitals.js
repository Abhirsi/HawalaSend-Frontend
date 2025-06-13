// Enhanced Web Vitals reporting with analytics integration
const reportWebVitals = (onPerfEntry, analyticsConfig) => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      // Core Web Vitals
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getLCP(onPerfEntry);
      
      // Additional metrics
      getFCP(onPerfEntry);
      getTTFB(onPerfEntry);
      
      // Analytics integration
      if (analyticsConfig) {
        const trackMetric = ({ name, value }) => {
          const eventName = analyticsConfig.eventName || 'web_vitals';
          const trackingData = {
            [name]: value,
            debug_mode: process.env.NODE_ENV !== 'production',
            page: window.location.pathname,
          };
          
          // Example: Send to analytics endpoint
          if (analyticsConfig.endpoint) {
            fetch(analyticsConfig.endpoint, {
              method: 'POST',
              body: JSON.stringify(trackingData),
              headers: { 'Content-Type': 'application/json' },
            });
          }
          
          // Example: Google Analytics
          if (window.gtag) {
            window.gtag('event', eventName, trackingData);
          }
        };
        
        getCLS(trackMetric);
        getFID(trackMetric);
        getLCP(trackMetric);
      }
    }).catch((error) => {
      console.error('Error loading web-vitals:', error);
    });
  }
};

// Development logging helper
if (process.env.NODE_ENV === 'development') {
  reportWebVitals(console.log);
}

export default reportWebVitals;