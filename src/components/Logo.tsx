import logo from "@/assets/nexa-logo.png";

export function Logo({ className = "h-10 w-auto" }: { className?: string }) {
  return <img src={logo} alt="NEXA TRADE MART" className={className} loading="eager" />;
}
