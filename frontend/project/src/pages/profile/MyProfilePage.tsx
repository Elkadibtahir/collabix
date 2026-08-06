import { useAuth } from '../../lib/auth-context';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Skeleton } from '../../components/ui/Skeleton';

export function MyProfilePage() {
  const { user } = useAuth();

  const displayName = user ? `${user.firstName} ${user.lastName}` : 'User';
  const displayInitials = user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` : 'U';

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start gap-5">
        <Avatar name={displayInitials} size="lg" tone={0} className="h-20 w-20" />
        <div className="flex-1 min-w-0 pt-1">
          <h1 className="text-display font-bold text-text-primary">{displayName}</h1>
          <p className="text-body text-text-secondary mt-0.5">{user.email}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge tone="accent" dot>Active</Badge>
            {user.roles.map((role) => (
              <Badge key={role} tone="success">{role}</Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
