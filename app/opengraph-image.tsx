import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Nokslock - Secure Digital Vault";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Shield icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 100,
            height: 100,
            borderRadius: 28,
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            marginBottom: 32,
            boxShadow: "0 20px 60px rgba(59, 130, 246, 0.3)",
          }}
        >
          <svg
            width="50"
            height="50"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: "white",
            letterSpacing: "-2px",
            marginBottom: 16,
          }}
        >
          Nokslock
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.4,
          }}
        >
          Secure Digital Vault & Encrypted File Storage
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 40,
          }}
        >
          {["Zero-Knowledge Encryption", "Dead Man's Switch", "Digital Inheritance"].map(
            (feature) => (
              <div
                key={feature}
                style={{
                  padding: "10px 24px",
                  borderRadius: 50,
                  border: "1px solid rgba(59, 130, 246, 0.4)",
                  color: "#60a5fa",
                  fontSize: 16,
                  fontWeight: 600,
                  background: "rgba(59, 130, 246, 0.1)",
                }}
              >
                {feature}
              </div>
            )
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
