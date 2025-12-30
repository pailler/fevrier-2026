'use client';

import QRCode from 'react-qr-code';

interface ServiceQRCodeProps {
  url: string;
  size?: number;
  className?: string;
}

export default function ServiceQRCode({ url, size = 80, className = '' }: ServiceQRCodeProps) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
        <QRCode
          value={url}
          size={size}
          level="M"
          style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
        />
      </div>
    </div>
  );
}

