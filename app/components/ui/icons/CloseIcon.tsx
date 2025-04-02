export default function CloseIcon({ className, strokeColor = "black" }: { className?: string; strokeColor?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="currentColor">
      <path
        d="M12.6663 4.7735L11.7263 3.8335L7.99967 7.56016L4.27301 3.8335L3.33301 4.7735L7.05967 8.50016L3.33301 12.2268L4.27301 13.1668L7.99967 9.44016L11.7263 13.1668L12.6663 12.2268L8.93967 8.50016L12.6663 4.7735Z"
        fill={strokeColor}
      />
    </svg>
  );
}
