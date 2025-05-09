import { useTheme } from "next-themes";
import Image from "next/image";

export function RiseLogo() {
  const { theme } = useTheme();

  function getRiseLogo() {
    return theme === "light" // doesnt work with dynamic theme
      ? "/icons/rise-light.svg"
      : "/icons/rise-dark.svg";
  }
  return (
    <Image
      src={getRiseLogo()}
      alt="RISE Logo"
      width={60}
      height={20}
      priority
    />
  );
}
