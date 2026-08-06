/* ---------- Query Key Factory ---------- */

type Key = readonly unknown[];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createQueryKeys<T extends Record<string, (...args: any[]) => Key>>(
  domain: string,
  definitions: T,
): { all: Key; list: (filters?: Record<string, unknown>) => Key; details: T } {
  const all: Key = [domain];

  const list = (filters?: Record<string, unknown>): Key => {
    if (filters) return [domain, 'list', filters];
    return [domain, 'list'];
  };

  const details = {} as T;
  for (const key in definitions) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fn = definitions[key] as (...args: any[]) => Key;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    details[key] = ((...args: any[]) => [domain, key, ...fn(...args)]) as unknown as T[typeof key];
  }

  return { all, list, details };
}

/* ---------- Query Keys ---------- */

export const queryKeys = {
  auth: createQueryKeys('auth', {
    session: () => [],
    user: (id: string) => [id],
  }),
  profile: createQueryKeys('profile', {
    me: () => [],
    account: () => [],
    preferences: () => [],
    notifications: () => [],
    sessions: () => [],
    activity: (page?: number) => [page],
  }),
  members: createQueryKeys('members', {
    detail: (id: string) => [id],
  }),
  teams: createQueryKeys('teams', {
    detail: (id: string) => [id],
  }),
  projects: createQueryKeys('projects', {
    detail: (id: string) => [id],
  }),
  tasks: createQueryKeys('tasks', {
    detail: (id: string) => [id],
  }),
  documents: createQueryKeys('documents', {
    detail: (id: string) => [id],
  }),
  knowledge: createQueryKeys('knowledge', {
    detail: (id: string) => [id],
    category: (slug: string) => [slug],
  }),
  notifications: createQueryKeys('notifications', {
    unreadCount: () => [],
  }),
  reports: createQueryKeys('reports', {
    detail: (id: string) => [id],
  }),
  admin: createQueryKeys('admin', {
    users: (filters?: Record<string, unknown>) => [filters],
    userDetail: (id: string) => [id],
    roles: (filters?: Record<string, unknown>) => [filters],
    roleDetail: (id: string) => [id],
    permissions: () => [],
    auditLogs: (filters?: Record<string, unknown>) => [filters],
    stats: () => [],
  }),
  workspace: createQueryKeys('workspace', {
    settings: () => [],
    departments: () => [],
    organization: () => [],
  }),
  handover: createQueryKeys('handover', {
    entryDetail: (id: string) => [id],
    journalDetail: (id: string) => [id],
  }),
} as const;
