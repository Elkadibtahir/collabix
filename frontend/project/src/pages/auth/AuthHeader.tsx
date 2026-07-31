export interface AuthHeaderProps {
  title: string;
  subtitle: string;
  id?: string;
}

export function AuthHeader({ title, subtitle, id }: AuthHeaderProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <h2 id={id} className="text-display font-bold text-text-primary tracking-tight">{title}</h2>
      <p className="text-body-lg text-text-secondary leading-relaxed">{subtitle}</p>
    </div>
  );
}
