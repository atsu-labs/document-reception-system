import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg+div]:pl-8',
  {
    variants: {
      variant: {
        default: 'bg-slate-50 text-slate-900 border-slate-200',
        destructive: 'bg-red-50 text-red-900 border-red-200',
        success: 'bg-green-50 text-green-900 border-green-200',
        warning: 'bg-yellow-50 text-yellow-900 border-yellow-200',
        info: 'bg-blue-50 text-blue-900 border-blue-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const iconMap = {
  default: Info,
  destructive: XCircle,
  success: CheckCircle2,
  warning: AlertCircle,
  info: Info,
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  onClose?: () => void;
}

export function Alert({
  className,
  variant = 'default',
  children,
  onClose,
  ...props
}: AlertProps) {
  const Icon = iconMap[variant || 'default'];

  return (
    <div
      role="alert"
      className={alertVariants({ variant, className })}
      {...props}
    >
      <Icon className="h-5 w-5" />
      <div className="flex-1">
        {children}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
          aria-label="閉じる"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function AlertTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={`mb-1 font-medium leading-none tracking-tight ${className || ''}`}
      {...props}
    />
  );
}

export function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      className={`text-sm [&_p]:leading-relaxed ${className || ''}`}
      {...props}
    />
  );
}
