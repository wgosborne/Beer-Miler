'use client';

interface SpinnerProps {
  /**
   * Size of the spinner - defaults to 'md'
   * sm: 32px, md: 48px, lg: 64px
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Color variant - defaults to 'default' (purple/blue)
   */
  variant?: 'default' | 'light' | 'bright';
  /**
   * Whether to show a centered full-screen loader
   */
  fullScreen?: boolean;
}

export function Spinner({ size = 'md', variant = 'default', fullScreen = false }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const colorClasses = {
    default: 'border-purple-600 border-t-purple-300',
    light: 'border-gray-700 border-t-gray-400',
    bright: 'border-blue-600 border-t-blue-300',
  };

  const spinner = (
    <div className="flex items-center justify-center">
      <div
        className={`
          ${sizeClasses[size]}
          border-4
          border-solid
          rounded-full
          animate-spin
          ${colorClasses[variant]}
        `}
      />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black">
        {spinner}
      </div>
    );
  }

  return spinner;
}
