import React from 'react';

const Card = React.forwardRef(({ className, ...props }, ref) => {
  const hasCustomBg   = className && className.includes('bg-');
  const hasCustomText = className && className.includes('text-');
  return (
    <div
      ref={ref}
      className={[
        'rounded-xl border shadow',
        hasCustomBg   ? '' : 'bg-white',
        hasCustomText ? '' : 'text-slate-900',
        className || ''
      ].filter(Boolean).join(' ')}
      {...props}
    />
  );
});
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={`flex flex-col space-y-1.5 p-6 ${className || ''}`} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={`font-semibold leading-none tracking-tight ${className || ''}`} {...props} />
));
CardTitle.displayName = "CardTitle";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={`p-6 pt-0 ${className || ''}`} {...props} />
));
CardContent.displayName = "CardContent";

export { Card, CardHeader, CardTitle, CardContent };
