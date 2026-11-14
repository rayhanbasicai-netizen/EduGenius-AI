interface LogoProps {
  variant?: 'light' | 'dark';
}

export function Logo({ variant = 'light' }: LogoProps) {
  const textColor = variant === 'light' ? 'text-white' : 'text-[#1E1B4B]';

  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 select-none">
      <svg
        width="32"
        height="32"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="edugeniusCapGrad" x1="2" y1="4" x2="34" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4338CA" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="32" height="32" rx="10" fill="url(#edugeniusCapGrad)" />
        {/* Graduation Cap */}
        <path
          d="M18 10L8.5 14.8L18 19.6L27.5 14.8L18 10Z"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="white"
          fillOpacity="0.16"
        />
        <path
          d="M12.2 17V22.4C12.2 24 14.8 25.5 18 25.5C21.2 25.5 23.8 24 23.8 22.4V17"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M26.5 15.4V21.5"
          stroke="white"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        {/* Crisp Sparkle */}
        <path
          d="M28.5 7.5L29.2 9.4L31.1 10.1L29.2 10.8L28.5 12.7L27.8 10.8L25.9 10.1L27.8 9.4L28.5 7.5Z"
          fill="#FDE68A"
        />
      </svg>
      <span className={`font-display text-lg font-bold tracking-tight ${textColor}`}>
        EduGenius AI
      </span>
    </span>
  );
}
