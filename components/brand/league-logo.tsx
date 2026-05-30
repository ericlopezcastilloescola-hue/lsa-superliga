import Image from "next/image";

const SIZES = {
  sm: 36,
  md: 48,
  lg: 72,
  xl: 120,
  hero: 160,
} as const;

export function LeagueLogo({
  size = "md",
  className = "",
  priority = false,
}: {
  size?: keyof typeof SIZES;
  className?: string;
  priority?: boolean;
}) {
  const px = SIZES[size];

  return (
    <Image
      src="/logo-lsa.png"
      alt="LSA Superliga"
      width={px}
      height={px}
      priority={priority}
      className={`object-contain drop-shadow-[0_0_12px_rgba(168,85,247,0.45)] ${className}`}
    />
  );
}
