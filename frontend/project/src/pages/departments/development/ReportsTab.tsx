import { DeptReports } from '../common/DeptReports';

export function DevelopmentReportsTab() {
  return (
    <DeptReports data={{
      categories: ['Sprint', 'Release', 'Code Quality', 'Performance', 'Security'],
      reports: [
        { id: 'r1', title: 'Sprint 24 Review Report', category: 'Sprint', date: '2026-07-22', author: 'Alex Kovac', favorite: true },
        { id: 'r2', title: 'Code Coverage Report Q3', category: 'Code Quality', date: '2026-07-18', author: 'David Wu', favorite: false },
        { id: 'r3', title: 'API Performance Benchmarks', category: 'Performance', date: '2026-07-15', author: 'Maya Mishra', favorite: true },
        { id: 'r4', title: 'Security Audit Report', category: 'Security', date: '2026-07-10', author: 'Maya Mishra', favorite: false },
        { id: 'r5', title: 'Release v3.2.0 Notes', category: 'Release', date: '2026-07-05', author: 'Alex Kovac', favorite: true },
        { id: 'r6', title: 'Dependency Vulnerability Scan', category: 'Security', date: '2026-06-30', author: 'David Wu', favorite: false },
      ],
    }} />
  );
}
