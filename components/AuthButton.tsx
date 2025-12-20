import React from "react";

type ButtonVariant = "primary" | "outline" | "dark" | "disabled";

interface AuthButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant: ButtonVariant;
  loading?: boolean;
}

const AuthButton: React.FC<AuthButtonProps> = ({
  variant,
  loading,
  children,
  className,
  ...rest
}) => {
  const styleMap: Record<ButtonVariant, string> = {
    primary: "bg-blue-400 text-white hover:bg-blue-600",
    outline: "text-blue-400 border border-blue-400 hover:bg-blue-300 hover:text-white hover:border-blue-300",
    dark: "bg-gray-800 text-white hover:bg-gray-900",
    disabled: "bg-gray-400 text-white cursor-not-allowed",
  };

  const baseStyles = "text-lg w-full py-2 rounded-md transition-all";

  return (
    <>
      <button
        className={`
          ${baseStyles}
          ${styleMap[variant]}
          ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
        disabled={loading || rest.disabled}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    </>
  );
};

export default AuthButton;
