'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface Props {
  text: string;
  size?: number;
}

export default function QRCodeDisplay({ text, size = 160 }: Props) {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    if (!text) return;
    QRCode.toDataURL(text, {
      width: size,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
      .then(url => setDataUrl(url))
      .catch(err => console.error('Error generating QR code:', err));
  }, [text, size]);

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className="bg-zinc-800 animate-pulse rounded-lg flex items-center justify-center text-xs text-zinc-500"
      >
        Generating QR...
      </div>
    );
  }

  return (
    <div className="bg-white p-2 rounded-xl shadow-lg inline-block border-2 border-amber-500/30">
      <img
        src={dataUrl}
        alt="Ticket Verification QR Code"
        width={size}
        height={size}
        className="rounded-md"
      />
    </div>
  );
}
