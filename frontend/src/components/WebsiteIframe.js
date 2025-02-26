import React, { useState } from 'react';
import { Loader } from 'lucide-react';

const WebsiteIframe = ({ 
  url = 'https://multimodalart-flux-style-shaping.hf.space',
  title = 'Embedded Website',
  height = '400px',
  width = '700px'
}) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="w-full relative">
      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <Loader className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      )}

      {/* Iframe */}
      <iframe
  src={url}
  title={title}
  className={`w-full rounded-lg border border-gray-200 bg-white transition-opacity duration-200 ${
    isLoading ? 'opacity-0' : 'opacity-100'
  }`}
  style={{
    height: height || '400px',
    width: '600px',
    border: '1px solid #222',
    position: 'relative',
    left: '50%',
  }}
  onLoad={() => setIsLoading(false)}
  loading="lazy"
/>
    </div>
  );
};

export default WebsiteIframe;