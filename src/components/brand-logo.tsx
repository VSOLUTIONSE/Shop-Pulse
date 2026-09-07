import Image from 'next/image';

/**
 * Shared brand mark. Single source of truth for the SalesPulse logo,
 * used on the landing page, auth screens, dashboard sidebar and print docs.
 * The landing navbar renders its own <Image> with priority — do not duplicate here.
 */
export function BrandLogo({ className = 'h-8 w-auto' }: { className?: string }) {
  return (
    <Image
      src="/landing/logo.png"
      alt="SalesPulse"
      width={42}
      height={42}
      className={className}
    />
  );
}
