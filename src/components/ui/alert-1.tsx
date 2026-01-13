import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button-1';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';

const alertVariants = cva('flex items-stretch w-full gap-2 group-[.toaster]:w-[var(--width)]', {
  variants: {
    variant: {
      secondary: '',
      primary: '',
      destructive: '',
      success: '',
      info: '',
      mono: '',
      warning: '',
    },
    icon: {
      primary: '',
      destructive: '',
      success: '',
      info: '',
      warning: '',
    },
    appearance: {
      solid: '',
      outline: '',
      light: '',
      stroke: 'text-foreground',
    },
    size: {
      lg: 'rounded-lg p-4 gap-3 text-base [&>[data-slot=alert-icon]>svg]:size-6 *:data-[slot=alert-icon]:mt-0.5 [&_[data-slot=alert-close]]:mt-1',
      md: 'rounded-lg p-3.5 gap-2.5 text-sm [&>[data-slot=alert-icon]>svg]:size-5 *:data-[slot=alert-icon]:mt-0 [&_[data-slot=alert-close]]:mt-0.5',
      sm: 'rounded-md px-3 py-2.5 gap-2 text-xs [&>[data-slot=alert-icon]>svg]:size-4 *:data-[slot=alert-icon]:mt-0.5 [&_[data-slot=alert-close]]:mt-0 [&_[data-slot=alert-close]_svg]:size-3.5',
    },
  },
  compoundVariants: [
    /* Solid */
    {
      variant: 'secondary',
      appearance: 'solid',
      className: 'bg-muted text-foreground',
    },
    {
      variant: 'primary',
      appearance: 'solid',
      className: 'bg-primary text-primary-foreground',
    },
    {
      variant: 'destructive',
      appearance: 'solid',
      className: 'bg-destructive text-destructive-foreground',
    },
    {
      variant: 'success',
      appearance: 'solid',
      className: 'bg-success text-success-foreground',
    },
    {
      variant: 'info',
      appearance: 'solid',
      className: 'bg-info text-info-foreground',
    },
    {
      variant: 'warning',
      appearance: 'solid',
      className: 'bg-warning text-warning-foreground',
    },
    {
      variant: 'mono',
      appearance: 'solid',
      className: 'bg-zinc-950 text-white dark:bg-zinc-300 dark:text-black *:data-[slot=alert-close]:text-white',
    },

    /* Outline */
    {
      variant: 'secondary',
      appearance: 'outline',
      className: 'border border-border bg-background text-foreground [&_[data-slot=alert-close]]:text-foreground',
    },
    {
      variant: 'primary',
      appearance: 'outline',
      className: 'border border-border bg-background text-primary [&_[data-slot=alert-close]]:text-foreground',
    },
    {
      variant: 'destructive',
      appearance: 'outline',
      className: 'border border-border bg-background text-destructive [&_[data-slot=alert-close]]:text-foreground',
    },
    {
      variant: 'success',
      appearance: 'outline',
      className: 'border border-border bg-background text-success [&_[data-slot=alert-close]]:text-foreground',
    },
    {
      variant: 'info',
      appearance: 'outline',
      className: 'border border-border bg-background text-info [&_[data-slot=alert-close]]:text-foreground',
    },
    {
      variant: 'warning',
      appearance: 'outline',
      className: 'border border-border bg-background text-warning [&_[data-slot=alert-close]]:text-foreground',
    },
    {
      variant: 'mono',
      appearance: 'outline',
      className: 'border border-border bg-background text-foreground [&_[data-slot=alert-close]]:text-foreground',
    },

    /* Light */
    {
      variant: 'secondary',
      appearance: 'light',
      className: 'bg-muted border border-border text-foreground',
    },
    {
      variant: 'primary',
      appearance: 'light',
      className:
        'text-foreground bg-primary/5 border border-primary/20 [&_[data-slot=alert-icon]]:text-primary dark:bg-primary/10 dark:border-primary/30',
    },
    {
      variant: 'destructive',
      appearance: 'light',
      className:
        'bg-destructive/5 border border-destructive/20 text-foreground [&_[data-slot=alert-icon]]:text-destructive dark:bg-destructive/10 dark:border-destructive/30',
    },
    {
      variant: 'success',
      appearance: 'light',
      className:
        'bg-success/5 border border-success/20 text-foreground [&_[data-slot=alert-icon]]:text-success dark:bg-success/10 dark:border-success/30',
    },
    {
      variant: 'info',
      appearance: 'light',
      className:
        'bg-info/5 border border-info/20 text-foreground [&_[data-slot=alert-icon]]:text-info dark:bg-info/10 dark:border-info/30',
    },
    {
      variant: 'warning',
      appearance: 'light',
      className:
        'bg-warning/5 border border-warning/20 text-foreground [&_[data-slot=alert-icon]]:text-warning dark:bg-warning/10 dark:border-warning/30',
    },

    /* Mono with icons */
    {
      variant: 'mono',
      icon: 'primary',
      className: '[&_[data-slot=alert-icon]]:text-primary',
    },
    {
      variant: 'mono',
      icon: 'warning',
      className: '[&_[data-slot=alert-icon]]:text-warning',
    },
    {
      variant: 'mono',
      icon: 'success',
      className: '[&_[data-slot=alert-icon]]:text-success',
    },
    {
      variant: 'mono',
      icon: 'destructive',
      className: '[&_[data-slot=alert-icon]]:text-destructive',
    },
    {
      variant: 'mono',
      icon: 'info',
      className: '[&_[data-slot=alert-icon]]:text-info',
    },
  ],
  defaultVariants: {
    variant: 'secondary',
    appearance: 'solid',
    size: 'md',
  },
});

interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  close?: boolean;
  onClose?: () => void;
}

interface AlertIconProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {}

function Alert({ className, variant, size, icon, appearance, close = false, onClose, children, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      data-slot="alert"
      className={cn(alertVariants({ variant, size, icon, appearance }), className)}
      {...props}
    >
      {children}
      {close && (
        <Button
          data-slot="alert-close"
          onClick={onClose}
          variant="ghost"
          mode="icon"
          size="sm"
          className="ms-auto shrink-0 self-start"
        >
          <X />
        </Button>
      )}
    </div>
  );
}

function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h5 data-slot="alert-title" className={cn('font-medium leading-none tracking-tight', className)} {...props} />;
}

function AlertIcon({ children, className, ...props }: AlertIconProps) {
  return (
    <div data-slot="alert-icon" className={cn('shrink-0', className)} {...props}>
      {children}
    </div>
  );
}

function AlertToolbar({ children, className, ...props }: AlertIconProps) {
  return (
    <div data-slot="alert-toolbar" className={cn('ms-auto flex items-center gap-2 shrink-0 self-start', className)} {...props}>
      {children}
    </div>
  );
}

function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      data-slot="alert-description"
      className={cn('text-sm [&_p]:leading-relaxed opacity-80', className)}
      {...props}
    />
  );
}

function AlertContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="alert-content"
      className={cn('flex flex-col gap-0.5 flex-1', className)}
      {...props}
    />
  );
}

export { Alert, AlertContent, AlertDescription, AlertIcon, AlertTitle, AlertToolbar };
