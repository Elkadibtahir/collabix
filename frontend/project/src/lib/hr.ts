export function isHrDepartment(name: string): boolean {
  const n = name.trim().toLowerCase();
  if (!n) return false;
  return (
    /(^|[\s\-_/&.,])hr([\s\-_/&.,]|$)/i.test(n) ||
    /(^|[\s\-_/&.,])rh([\s\-_/&.,]|$)/i.test(n) ||
    /human\s*resources?/i.test(n) ||
    /ressources?\s*humaines?/i.test(n) ||
    /people\s*(ops|operations)?/i.test(n) ||
    /people\s*(&|and)\s*culture/i.test(n) ||
    /talent|personnel|recruit(ing|ment)?|culture|hrm\b/i.test(n)
  );
}

export const HR_TAB_IDS = [
  'dashboard',
  'employees',
  'candidates',
  'interviews',
  'skills',
  'onboarding',
  'reviews',
  'attendance',
  'documents',
  'notifications',
] as const;
