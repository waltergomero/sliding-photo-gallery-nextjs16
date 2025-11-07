'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

// Extend Window interface to include jQuery
declare global {
  interface Window {
    jQuery: {
      fancybox?: unknown;
    } & ((selector: string) => unknown);
    $: ((selector: string) => unknown);
  }
}

export default function GalleryPageScripts() {
  const [jqueryLoaded, setJqueryLoaded] = useState(false);
  const [fancyboxLoaded, setFancyboxLoaded] = useState(false);
  const [customLoaded, setCustomLoaded] = useState(false);

  useEffect(() => {
    // Only proceed when both jQuery and Fancybox are loaded
    if (jqueryLoaded && fancyboxLoaded && !customLoaded) {
      console.log('All dependencies loaded, initializing gallery...');
      
      // Make sure $ is globally available
      if (typeof window !== 'undefined' && window.jQuery) {
        window.$ = window.jQuery;
        
        // Debug logging
        console.log('Gallery debug script executing');
        console.log('jQuery available:', typeof window.jQuery !== 'undefined');
        console.log('$ available:', typeof window.$ !== 'undefined');
        console.log('Fancybox available:', typeof window.jQuery.fancybox !== 'undefined');
      }
    }
  }, [jqueryLoaded, fancyboxLoaded, customLoaded]);

  return (
    <>
      <Script 
        src="/assets/js/jquery.min.js" 
        strategy="afterInteractive"
        onLoad={() => {
          console.log('jQuery loaded successfully');
          setJqueryLoaded(true);
        }}
        onError={() => {
          console.error('Failed to load jQuery');
        }}
      />
      
      {jqueryLoaded && (
        <Script 
          src="/assets/js/jquery.fancybox.min.js" 
          strategy="afterInteractive"
          onLoad={() => {
            console.log('Fancybox loaded successfully');
            setFancyboxLoaded(true);
          }}
          onError={() => {
            console.error('Failed to load Fancybox');
          }}
        />
      )}
      
      {jqueryLoaded && fancyboxLoaded && (
        <Script 
          src="/assets/js/custom.js"
          strategy="afterInteractive"
          onLoad={() => {
            console.log('Custom.js loaded successfully');
            setCustomLoaded(true);
          }}
          onError={() => {
            console.error('Failed to load custom.js');
          }}
        />
      )}
    </>
  );
}
