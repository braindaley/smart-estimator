'use client';

import { Label } from '@/components/ui/label';

export default function ClickableLabel({ 
  children, 
  onClick, 
  hasData = false, 
  className = '' 
}) {
  const baseClasses = "text-sm text-gray-600";
  const clickableClasses = hasData 
    ? "cursor-pointer hover:text-blue-600 hover:underline" 
    : "";
  const indicatorClasses = hasData 
    ? "relative after:content-['📊'] after:ml-1 after:text-xs" 
    : "";

  return (
    <Label 
      className={`${baseClasses} ${clickableClasses} ${indicatorClasses} ${className}`}
      onClick={hasData ? onClick : undefined}
      title={hasData ? "Click to view transaction details" : undefined}
    >
      {children}
    </Label>
  );
}