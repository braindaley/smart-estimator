import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 30"
      width="140"
      height="24"
      aria-label="Momentum logo"
      {...props}
    >
      <text
        x="0"
        y="22"
        fontFamily="'Inter', sans-serif"
        fontSize="20"
        fontWeight="600"
        className="fill-foreground"
      >
        Momentum
      </text>
    </svg>
  );
}
