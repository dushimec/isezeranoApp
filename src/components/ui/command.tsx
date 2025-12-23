import React from 'react';

export const Command: React.FC<React.PropsWithChildren> = ({ children }) => <div>{children}</div>;
export const CommandEmpty: React.FC<React.PropsWithChildren> = ({ children }) => <div>{children}</div>;
export const CommandGroup: React.FC<React.PropsWithChildren> = ({ children }) => <div>{children}</div>;
export const CommandInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => <input {...props} />;
export const CommandItem: React.FC<React.PropsWithChildren<{
  onSelect?: (...args: any[]) => void;
  className?: string;
  style?: React.CSSProperties;
}>> = ({ children, onSelect, ...props }) => (
  <div onClick={() => onSelect && onSelect()} {...props}>{children}</div>
);
export const CommandList: React.FC<React.PropsWithChildren> = ({ children }) => <div>{children}</div>;
export const CommandSeparator: React.FC = () => <div className="h-px bg-muted my-2" />;
