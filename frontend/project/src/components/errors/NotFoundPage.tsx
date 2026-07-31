import { useNavigate } from 'react-router-dom';
import { SearchX, ArrowLeft, LayoutGrid, Search } from 'lucide-react';
import { AuthLayout } from '../layout/AuthLayout';
import { Button } from '../ui/Button';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-6 py-6 text-center animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warning-50 text-warning-500">
          <SearchX className="h-9 w-9" />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-hero font-bold text-text-primary tracking-tight">404</span>
          </div>
          <h2 className="text-display font-bold text-text-primary tracking-tight">Page Not Found</h2>
          <p className="text-body text-text-secondary leading-relaxed max-w-sm">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2.5 mt-2">
          <Button
            size="lg"
            fullWidth
            leftIcon={<LayoutGrid />}
            onClick={() => navigate('/app/dashboard')}
          >
            Return to Dashboard
          </Button>
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
            variant="ghost"
            leftIcon={<Search />}
            onClick={() => navigate('/app/dashboard')}
          >
            Search Collabix
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
