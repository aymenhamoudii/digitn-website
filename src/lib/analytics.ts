// Analytics tracking utilities
export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  // Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, eventParams)
  }

  // Meta Pixel
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, eventParams)
  }
}

// Track page views
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
      page_path: url,
    })
  }
}

// Track conversions
export const trackConversion = (conversionType: 'contact' | 'plan_selected' | 'whatsapp_click', data?: Record<string, any>) => {
  trackEvent(conversionType, data)
}
