import type { SVGProps } from 'react';

export function DocflowLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width="1em"
      height="1em"
      {...props}
    >
      <path
        fill="currentColor"
        d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88Z"
      />
      <path
        fill="currentColor"
        d="M168 88a40 40 0 0 0-40-40H96v128h32a40 40 0 0 0 40-40Zm-32 24v-48h8a24 24 0 0 1 0 48Z"
      />
    </svg>
  );
}
