// ShopNDrop logo: a teal shopping bag with a "drop" arrow.
// <Logo size={36} /> or <Logo size={56} stacked /> or <Logo light />
export const LogoMark = ({ size = 36 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M23 21v-5a9 9 0 0 1 18 0v5"
      stroke="#0b4a52"
      strokeWidth="3.6"
      strokeLinecap="round"
    />
    <path
      d="M15.5 19h33a2 2 0 0 1 2 1.8l2.6 29a6 6 0 0 1-6 6.6H16.9a6 6 0 0 1-6-6.6l2.6-29a2 2 0 0 1 2-1.8z"
      fill="#6bb8b2"
      stroke="#0b4a52"
      strokeWidth="3.6"
      strokeLinejoin="round"
    />
    <path d="M23 19v4.5M41 19v4.5" stroke="#0b4a52" strokeWidth="3.6" strokeLinecap="round" />
    <path
      d="M29.5 27h5v9.5h5.5L32 46l-8-9.5h5.5z"
      fill="#6bb8b2"
      stroke="#0b4a52"
      strokeWidth="3.2"
      strokeLinejoin="round"
    />
  </svg>
);

const Logo = ({ size = 36, stacked = false, light = false }) => (
  <span className={`logo-lockup ${stacked ? "stacked" : ""} ${light ? "light" : ""}`}>
    <LogoMark size={size} />
    <span className="logo-text" style={{ fontSize: size * (stacked ? 0.6 : 0.62) }}>
      ShopNDrop
    </span>
  </span>
);

export default Logo;
