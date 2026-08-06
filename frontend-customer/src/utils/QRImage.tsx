/**
 * Component <QRImage /> — render QR code SVG inline.
 * Logic tạo QR được tách ra `utils/qr.ts` để file này chỉ lo UI.
 */
import { useEffect, useState } from "react";
import { buildQRDataURL } from "./qr";

export function QRImage({
  code,
  size = 120,
  className,
  style,
}: {
  code: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [src, setSrc] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    buildQRDataURL(code, size)
      .then((url) => {
        if (cancelled) return;
        setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setSrc("");
      });
    return () => {
      cancelled = true;
    };
  }, [code, size]);

  if (!src) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          background: "#F1F5F9",
          borderRadius: 8,
          ...style,
        }}
      />
    );
  }

  return (
    <img
      src={src}
      alt="QR Code"
      width={size}
      height={size}
      className={className}
      style={{ display: "block", borderRadius: 8, ...style }}
    />
  );
}