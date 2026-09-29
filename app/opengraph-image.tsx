import { ImageResponse } from "next/og";

export const alt = "Bujh — MCQ practice for CTEVT and +2 programmes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Default social card. Programme pages override the title/description in their
 * own metadata; this image is the brand backdrop for everything else.
 *
 * Plain text only — the default font in `ImageResponse` has no emoji glyphs.
 */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #17171f 0%, #0b0b10 100%)",
          color: "#fafafa",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 104,
            fontWeight: 700,
            letterSpacing: "-3px",
            color: "#c4b5fd",
          }}
        >
          Bujh
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 44,
            fontWeight: 600,
            textAlign: "center",
            lineHeight: 1.25,
          }}
        >
          MCQ practice built around your syllabus
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 28,
            color: "#9ca3af",
            textAlign: "center",
          }}
        >
          CTEVT diplomas and certificate courses · +2 Science, Computer and
          Management
        </div>
      </div>
    ),
    size
  );
}
