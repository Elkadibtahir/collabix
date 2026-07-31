import { useNavigate } from 'react-router-dom';
import { ShieldBan, ArrowLeft, LayoutGrid, LifeBuoy } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';

export function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-6 py-6 text-center animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-50 text-danger-500">
          <ShieldBan className="h-9 w-9" />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-display font-bold text-text-primary tracking-tight">Access Denied</h2>
          <p className="text-body text-text-secondary leading-relaxed max-w-sm">
            You do not have permission to access this page.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2.5 mt-2">
          <Button
            size="lg"
            fullWidth
            variant="outline"
            leftIcon={<ArrowLeft />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          <Button
            size="lg"
            fullWidth
            variant="primary"
            leftIcon={<LayoutGrid />}
            onClick={() => navigate('/app/dashboard')}
          >
            Return to Dashboard
          </Button>
          <Button size="lg" fullWidth variant="ghost" leftIcon={<LifeBuoy />}>
            Contact Administrator
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
