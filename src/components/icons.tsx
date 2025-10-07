import React, { SVGProps } from "react";

export function IsezeranoLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width="100"
      height="100"
      {...props}
    >
      <path
        d="M50 10 C 27.9 10 10 27.9 10 50 C 10 72.1 27.9 90 50 90 C 72.1 90 90 72.1 90 50 C 90 27.9 72.1 10 50 10 Z M 50 15 C 69.3 15 85 30.7 85 50 C 85 69.3 69.3 85 50 85 C 30.7 85 15 69.3 15 50 C 15 30.7 30.7 15 50 15 Z"
        fill="hsl(var(--primary))"
      />
      <text
        x="50"
        y="62"
        fontFamily="Playfair Display, serif"
        fontSize="40"
        fill="hsl(var(--primary))"
        textAnchor="middle"
      >
        I
      </text>
    </svg>
  );
}
