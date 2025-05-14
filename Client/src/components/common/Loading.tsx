import React from "react";

interface LoadingProps {
  size?: "small" | "medium" | "large";
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  size = "medium",
  text = "Loading...",
  fullScreen = false,
  overlay = false,
}) => {
  // Size mapping for spinner and text
  const spinnerSizes = {
    small: "h-6 w-6 border-2",
    medium: "h-10 w-10 border-2",
    large: "h-16 w-16 border-3",
  };

  const textSizes = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  };

  // Component classes based on props
  const containerClasses = `flex flex-col items-center justify-center ${
    fullScreen ? "fixed inset-0 z-50" : "p-8"
  } ${overlay ? "bg-white/80 backdrop-blur-sm" : ""}`;

  return (
    <div className={containerClasses}>
      <div
        className={`${spinnerSizes[size]} animate-spin rounded-full border-t-transparent border-b-transparent border-indigo-600`}
      ></div>
      {text && (
        <p className={`mt-4 text-gray-700 font-medium ${textSizes[size]}`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default Loading;
