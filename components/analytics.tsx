'use client'

import Script from 'next/script'

export function Analytics() {
  const analyticsUrl = process.env.NEXT_PUBLIC_ANALYTICS_URL
  const analyticsDomain = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN

  if (!analyticsUrl || !analyticsDomain) {
    return null
  }

  return (
    <>
      <Script src={analyticsUrl} data-domain={analyticsDomain} strategy="afterInteractive" />
      <noscript>
        <img
          src={`${analyticsUrl}/noscript.gif?domain=${analyticsDomain}`}
          alt=""
          style={{ position: 'absolute', opacity: 0 }}
        />
      </noscript>
    </>
  )
}
