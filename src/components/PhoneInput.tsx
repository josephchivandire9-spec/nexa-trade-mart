import { getCountries, getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js/min";
import { useMemo, useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

// Curated list of common Southern African + global countries first, then the rest.
const PRIORITY: CountryCode[] = ["ZA", "ZW", "BW", "NA", "MZ", "LS", "SZ", "MW", "ZM", "KE", "NG", "GH", "GB", "US"];

function flagEmoji(cc: string): string {
  return cc.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

export interface PhoneInputProps {
  value: string; // stored as E.164 (e.g. +27821234567) or empty
  onChange: (e164: string) => void;
  defaultCountry?: CountryCode;
  placeholder?: string;
  className?: string;
}

export function PhoneInput({ value, onChange, defaultCountry = "ZA", placeholder, className = "" }: PhoneInputProps) {
  const parsed = useMemo(() => (value ? parsePhoneNumberFromString(value) : undefined), [value]);
  const [country, setCountry] = useState<CountryCode>(parsed?.country ?? defaultCountry);
  const [national, setNational] = useState<string>(parsed?.nationalNumber ? String(parsed.nationalNumber) : (value && !value.startsWith("+") ? value : ""));

  useEffect(() => {
    if (parsed?.country && parsed.country !== country) setCountry(parsed.country);
    if (parsed?.nationalNumber && String(parsed.nationalNumber) !== national) setNational(String(parsed.nationalNumber));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const countries = useMemo(() => {
    const all = getCountries();
    const rest = all.filter((c) => !PRIORITY.includes(c)).sort();
    return [...PRIORITY.filter((c) => all.includes(c)), ...rest];
  }, []);

  function emit(nextCountry: CountryCode, nextNational: string) {
    const digits = nextNational.replace(/\D/g, "");
    if (!digits) return onChange("");
    const p = parsePhoneNumberFromString(digits, nextCountry);
    onChange(p?.isValid() ? p.number : `+${getCountryCallingCode(nextCountry)}${digits}`);
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <div className="relative">
        <select
          value={country}
          onChange={(e) => {
            const c = e.target.value as CountryCode;
            setCountry(c);
            emit(c, national);
          }}
          className="appearance-none h-12 pl-3 pr-8 rounded-lg border border-border bg-background text-sm outline-none focus:border-gold min-w-[110px]"
        >
          {countries.map((c) => (
            <option key={c} value={c}>
              {flagEmoji(c)} {c} +{getCountryCallingCode(c)}
            </option>
          ))}
        </select>
        <ChevronDown className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
      </div>
      <input
        type="tel"
        inputMode="tel"
        value={national}
        placeholder={placeholder ?? "82 123 4567"}
        onChange={(e) => {
          const v = e.target.value;
          setNational(v);
          emit(country, v);
        }}
        maxLength={20}
        className="flex-1 h-12 rounded-lg border border-border bg-background px-3 text-base outline-none focus:border-gold"
      />
    </div>
  );
}

export function formatE164Display(value: string | null | undefined): string {
  if (!value) return "";
  const p = parsePhoneNumberFromString(value);
  return p ? p.formatInternational() : value;
}

export function e164DigitsForWhatsApp(value: string | null | undefined): string {
  if (!value) return "";
  const p = parsePhoneNumberFromString(value);
  const num = p ? p.number : value;
  return num.replace(/\D/g, "");
}
