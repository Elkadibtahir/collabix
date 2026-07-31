import { DeptReports } from '../common/DeptReports';

export function AIReportsTab() {
  return (
    <DeptReports data={{
      categories: ['Research', 'Experiment', 'Model', 'Performance', 'Innovation'],
      reports: [
        { id: 'r1', title: 'Q3 AI Research Summary', category: 'Research', date: '2026-07-20', author: 'Pete Briggs', favorite: true },
        { id: 'r2', title: 'Experiment Log - Week 29', category: 'Experiment', date: '2026-07-18', author: 'Mark Kim', favorite: false },
        { id: 'r3', title: 'Model Performance Benchmark', category: 'Model', date: '2026-07-15', author: 'Anna Chen', favorite: true },
        { id: 'r4', title: 'Automation ROI Analysis', category: 'Performance', date: '2026-07-10', author: 'Sarah Yu', favorite: false },
        { id: 'r5', title: 'Innovation Pipeline Review', category: 'Innovation', date: '2026-07-05', author: 'Dr. Rachel Lin', favorite: true },
        { id: 'r6', title: 'Chatbot v2 A/B Test Results', category: 'Experiment', date: '2026-06-28', author: 'Mark Kim', favorite: false },
      ],
    }} />
  );
}
