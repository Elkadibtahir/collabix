import { Button } from '../../components/ui/Button';
import type { ButtonProps } from '../../components/ui/Button';

export interface LoadingButtonProps extends Omit<ButtonProps, 'loading'> {
  loading?: boolean;
  loadingText?: string;
}

export function LoadingButton({ loading, loadingText, children, disabled, ...rest }: LoadingButtonProps) {
  return (
    <Button
      {...rest}
      loading={loading}
      disabled={disabled || loading}
    >
      {loading && loadingText ? loadingText : children}
    </Button>
  );
}
