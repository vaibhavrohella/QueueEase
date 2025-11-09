import React from "react";

interface QueueEaseLogoProps {
  className?: string;
  size?: number;
  variant?: "full" | "icon";
}

const LogoIcon: React.FC<{ size: number; className?: string }> = ({ size, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Smooth flowing queue lines representing ease and flow */}
    <path
      d="M12 32C12 32 16 28 20 32C24 36 28 32 32 32C36 32 40 36 44 32C48 28 52 32 52 32"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Additional flowing line for depth */}
    <path
      d="M12 40C12 40 16 36 20 40C24 44 28 40 32 40C36 40 40 44 44 40C48 36 52 40 52 40"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.7"
    />
    {/* Checkmark/checkpoint at the end representing completion/ease */}
    <circle
      cx="52"
      cy="36"
      r="4"
      fill="currentColor"
    />
    <path
      d="M49 36L51 38L55 34"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const QueueEaseLogo: React.FC<QueueEaseLogoProps> = ({ 
  className = "", 
  size = 32,
  variant = "icon" 
}) => {
  if (variant === "icon") {
    return <LogoIcon size={size} className={className} />;
  }

  // Full logo with text
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LogoIcon size={size} className={className} />
      <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        QueueEase
      </span>
    </div>
  );
};

export default QueueEaseLogo;

