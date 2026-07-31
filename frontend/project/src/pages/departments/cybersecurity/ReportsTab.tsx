import { DeptReports } from '../common/DeptReports';

export function CybersecurityReportsTab() {
  return (
    <DeptReports data={{
      categories: ['Audit', 'Incident', 'Compliance', 'Vulnerability', 'Risk'],
      reports: [
        { id: 'r1', title: 'Monthly Security Audit Report', category: 'Audit', date: '2026-07-20', author: 'James Doe', favorite: true },
        { id: 'r2', title: 'Incident Summary - June 2026', category: 'Incident', date: '2026-07-01', author: 'Sofia Cruz', favorite: false },
        { id: 'r3', title: 'SOC 2 Compliance Report', category: 'Compliance', date: '2026-06-30', author: 'James Doe', favorite: true },
        { id: 'r4', title: 'Vulnerability Scan Results Q3', category: 'Vulnerability', date: '2026-06-25', author: 'Raj Mehta', favorite: false },
        { id: 'r5', title: 'Risk Assessment Report', category: 'Risk', date: '2026-06-20', author: 'Ahmed Hassan', favorite: true },
        { id: 'r6', title: 'Quarterly Security Review', category: 'Audit', date: '2026-06-15', author: 'Ahmed Hassan', favorite: false },
      ],
    }} />
  );
}
