import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 160 30"
      width="160"
      height="30"
      aria-label="Debt Prototype logo"
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
        Debt Prototype
      </text>
    </svg>
  );
}
