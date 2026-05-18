import React from 'react';

export const countryCodes = [
  { code: '+91', country: 'IN', flag: '🇮🇳' },
  { code: '+1', country: 'US', flag: '🇺🇸' },
  { code: '+44', country: 'GB', flag: '🇬🇧' },
  { code: '+971', country: 'AE', flag: '🇦🇪' },
  { code: '+61', country: 'AU', flag: '🇦🇺' },
  { code: '+1', country: 'CA', flag: '🇨🇦' },
  { code: '+65', country: 'SG', flag: '🇸🇬' },
  { code: '+81', country: 'JP', flag: '🇯🇵' },
  { code: '+49', country: 'DE', flag: '🇩🇪' },
  { code: '+33', country: 'FR', flag: '🇫🇷' },
];

const CountryCodeDropdown = ({ selectedCode, onChange, disabled }) => {
  return (
    <div className="relative group">
      <select
        value={selectedCode}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-full pl-3 pr-8 py-2.5 rounded-l-xl border-r border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-colors disabled:opacity-50"
      >
        {countryCodes.map((c) => (
          <option key={`${c.country}-${c.code}`} value={c.code}>
            {c.flag} {c.code}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-400 group-hover:text-slate-600">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default CountryCodeDropdown;
