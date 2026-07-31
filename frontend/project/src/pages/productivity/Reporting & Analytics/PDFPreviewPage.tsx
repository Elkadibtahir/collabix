import { useState } from 'react';
import {
  ArrowLeft,
  Download,
  Share2,
  Printer,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { IconButton } from '../../../components/ui/IconButton';
import { Dropdown, type DropdownItem } from '../../../components/ui/Dropdown';

export function PDFPreviewPage({ onBack }: { onBack?: () => void }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const totalPages = 15;

  const actionItems: DropdownItem[] = [
    { label: 'Download PDF', icon: <Download className="h-4 w-4" /> },
    { label: 'Print', icon: <Printer className="h-4 w-4" /> },
    { label: 'Share', icon: <Share2 className="h-4 w-4" /> },
  ];

  return (
    <div className="flex flex-col h-screen bg-surface">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between gap-4 border-b border-border-subtle bg-surface-2 px-4 py-3 shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-text-secondary hover:bg-surface hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div>
            <h1 className="text-body font-semibold text-text-primary">
              October 2024 Workspace Summary
            </h1>
            <p className="text-2xs text-text-tertiary">15 pages • 2.4 MB</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<Download />}>
            Download
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Printer />}>
            Print
          </Button>
          <Dropdown
            trigger={<IconButton label="More" variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></IconButton>}
            items={actionItems}
            align="right"
          />
        </div>
      </div>

      {/* PDF Viewer Area */}
      <div className="flex-1 overflow-auto bg-neutral-900 dark:bg-neutral-950 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-neutral-800 shadow-2xl"
          style={{
            width: '8.5in',
            height: '11in',
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease-out',
          }}
        >
          {currentPage === 1 && <CoverPage />}
          {currentPage === 2 && <ExecutiveSummaryPage />}
          {currentPage === 3 && <StatisticsPage1 />}
          {currentPage === 4 && <StatisticsPage2 />}
          {currentPage === 5 && <ChartsPage1 />}
          {currentPage >= 6 && currentPage <= 8 && <DetailsPage />}
          {currentPage >= 9 && currentPage <= 12 && <TablesPage />}
          {currentPage === 13 && <ActivityPage />}
          {currentPage === 14 && <SummaryPage />}
          {currentPage === 15 && <FooterPage />}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-between gap-4 border-t border-border-subtle bg-surface-2 px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <IconButton
            label="Previous"
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </IconButton>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border-subtle bg-surface">
            <span className="text-caption font-medium text-text-primary">{currentPage}</span>
            <span className="text-caption text-text-tertiary">/</span>
            <span className="text-caption text-text-tertiary">{totalPages}</span>
          </div>

          <IconButton
            label="Next"
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </IconButton>
        </div>

        <div className="flex items-center gap-2">
          <IconButton
            label="Zoom Out"
            variant="outline"
            size="sm"
            onClick={() => setZoom((z) => Math.max(50, z - 10))}
          >
            <ZoomOut className="h-4 w-4" />
          </IconButton>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border-subtle bg-surface">
            <span className="text-caption font-medium text-text-primary">{zoom}%</span>
          </div>

          <IconButton
            label="Zoom In"
            variant="outline"
            size="sm"
            onClick={() => setZoom((z) => Math.min(200, z + 10))}
          >
            <ZoomIn className="h-4 w-4" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

function CoverPage() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-accent-600 to-accent-700 text-white p-12">
      <div className="text-center space-y-6">
        <div className="text-6xl font-bold">📊</div>
        <h1 className="text-5xl font-bold">Workspace Report</h1>
        <p className="text-2xl opacity-90">October 2024 Summary</p>
        <div className="pt-12 border-t border-white/30 space-y-2">
          <p className="text-lg">Generated on October 25, 2024</p>
          <p className="opacity-75">Comprehensive Performance Analysis</p>
        </div>
      </div>
    </div>
  );
}

function ExecutiveSummaryPage() {
  return (
    <div className="w-full h-full p-12 flex flex-col text-neutral-900 dark:text-neutral-100">
      <h1 className="text-4xl font-bold mb-2">Executive Summary</h1>
      <div className="h-1 w-24 bg-accent-600 mb-8"></div>

      <div className="flex-1 space-y-4">
        <p className="text-base leading-relaxed">
          This workspace report provides a comprehensive overview of organizational performance metrics,
          team productivity, and project execution status for October 2024. The analysis includes key
          performance indicators, trend analysis, and actionable insights.
        </p>

        <div className="pt-4 space-y-3">
          <h2 className="text-lg font-semibold">Key Highlights</h2>
          <ul className="space-y-2 pl-4">
            <li className="text-sm">• Overall productivity increased by 12% compared to September</li>
            <li className="text-sm">• 67% task completion rate with 45 active team members</li>
            <li className="text-sm">• 12 active projects with 87% deadline compliance</li>
            <li className="text-sm">• 45 knowledge base articles contributed this month</li>
          </ul>
        </div>

        <div className="pt-4 space-y-3">
          <h2 className="text-lg font-semibold">Report Scope</h2>
          <p className="text-sm">
            This report covers all departments, teams, and projects within the workspace during
            the reporting period. Data was collected from all active systems and aggregated for
            comprehensive analysis.
          </p>
        </div>
      </div>

      <div className="text-center text-2xs text-neutral-500 mt-auto">Page 2</div>
    </div>
  );
}

function StatisticsPage1() {
  return (
    <div className="w-full h-full p-12 flex flex-col text-neutral-900 dark:text-neutral-100">
      <h1 className="text-3xl font-bold mb-1">Key Statistics</h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">Performance Metrics</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
        <StatBox label="Total Tasks" value="234" change={12} />
        <StatBox label="Completion Rate" value="67%" change={5} />
        <StatBox label="Active Projects" value="12" change={-2} />
        <StatBox label="Team Members" value="45" change={0} />
        <StatBox label="Documents" value="156" change={8} />
        <StatBox label="KB Articles" value="45" change={15} />
      </div>

      <div className="text-center text-2xs text-neutral-500 mt-auto">Page 3</div>
    </div>
  );
}

function StatisticsPage2() {
  return (
    <div className="w-full h-full p-12 flex flex-col text-neutral-900 dark:text-neutral-100">
      <h1 className="text-3xl font-bold mb-1">Performance Indicators</h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">Quality Metrics</p>

      <div className="space-y-4 flex-1">
        <ProgressBar label="Productivity Score" value={78} />
        <ProgressBar label="Deadline Compliance" value={87} />
        <ProgressBar label="Knowledge Contribution" value={65} />
        <ProgressBar label="Document Repository" value={72} />
        <ProgressBar label="Team Utilization" value={81} />
      </div>

      <div className="text-center text-2xs text-neutral-500 mt-auto">Page 4</div>
    </div>
  );
}

function ChartsPage1() {
  return (
    <div className="w-full h-full p-12 flex flex-col text-neutral-900 dark:text-neutral-100">
      <h1 className="text-3xl font-bold mb-1">Performance Trends</h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">Visual Analysis</p>

      <div className="flex-1 flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700">
        <div className="text-center">
          <p className="text-sm font-semibold mb-2">Chart Visualization Area</p>
          <p className="text-xs text-neutral-500">Performance trend charts display here in generated reports</p>
        </div>
      </div>

      <div className="text-center text-2xs text-neutral-500 mt-6">Page 5</div>
    </div>
  );
}

function DetailsPage() {
  return (
    <div className="w-full h-full p-12 flex flex-col text-neutral-900 dark:text-neutral-100">
      <h1 className="text-3xl font-bold mb-1">Detailed Analysis</h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">Comprehensive Breakdown</p>

      <div className="space-y-4 flex-1 text-sm">
        <section>
          <h2 className="font-semibold mb-2">Department Performance</h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Analysis of individual department metrics, team performance, and contribution patterns.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">Project Status</h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Overview of all active projects, milestones achieved, and expected completion dates.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">Team Insights</h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Individual team member performance, utilization rates, and contribution metrics.
          </p>
        </section>
      </div>

      <div className="text-center text-2xs text-neutral-500 mt-auto">Pages 6-8</div>
    </div>
  );
}

function TablesPage() {
  return (
    <div className="w-full h-full p-12 flex flex-col text-neutral-900 dark:text-neutral-100">
      <h1 className="text-3xl font-bold mb-1">Data Tables</h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">Detailed Records</p>

      <table className="w-full text-sm flex-1 border-collapse">
        <thead>
          <tr className="border-b-2 border-neutral-300">
            <th className="text-left py-2 font-semibold">Department</th>
            <th className="text-center py-2 font-semibold">Tasks</th>
            <th className="text-center py-2 font-semibold">Completed</th>
            <th className="text-center py-2 font-semibold">Rate</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-neutral-200">
            <td className="py-2">Engineering</td>
            <td className="text-center">85</td>
            <td className="text-center">71</td>
            <td className="text-center">84%</td>
          </tr>
          <tr className="border-b border-neutral-200">
            <td className="py-2">Product</td>
            <td className="text-center">45</td>
            <td className="text-center">32</td>
            <td className="text-center">71%</td>
          </tr>
          <tr className="border-b border-neutral-200">
            <td className="py-2">Design</td>
            <td className="text-center">32</td>
            <td className="text-center">28</td>
            <td className="text-center">88%</td>
          </tr>
          <tr>
            <td className="py-2 font-semibold">Total</td>
            <td className="text-center font-semibold">234</td>
            <td className="text-center font-semibold">156</td>
            <td className="text-center font-semibold">67%</td>
          </tr>
        </tbody>
      </table>

      <div className="text-center text-2xs text-neutral-500 mt-auto">Pages 9-12</div>
    </div>
  );
}

function ActivityPage() {
  return (
    <div className="w-full h-full p-12 flex flex-col text-neutral-900 dark:text-neutral-100">
      <h1 className="text-3xl font-bold mb-1">Activity Timeline</h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">Recent Events</p>

      <div className="space-y-3 flex-1">
        <TimelineItem date="Oct 25" title="Monthly Report Generated" />
        <TimelineItem date="Oct 24" title="API Gateway v2 Milestone Completed" />
        <TimelineItem date="Oct 23" title="45 Knowledge Base Articles Published" />
        <TimelineItem date="Oct 22" title="Q3 Performance Analysis Completed" />
        <TimelineItem date="Oct 20" title="Engineering Sprint Concluded" />
      </div>

      <div className="text-center text-2xs text-neutral-500 mt-auto">Page 13</div>
    </div>
  );
}

function SummaryPage() {
  return (
    <div className="w-full h-full p-12 flex flex-col text-neutral-900 dark:text-neutral-100">
      <h1 className="text-3xl font-bold mb-1">Conclusions & Recommendations</h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">Summary</p>

      <div className="space-y-4 flex-1 text-sm">
        <section>
          <h2 className="font-semibold mb-2">Key Findings</h2>
          <ul className="space-y-1 pl-4 list-disc text-neutral-600 dark:text-neutral-400">
            <li>Strong overall performance with 12% productivity increase</li>
            <li>High deadline compliance at 87% across all projects</li>
            <li>Effective knowledge sharing with 45 articles contributed</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold mb-2">Recommendations</h2>
          <ul className="space-y-1 pl-4 list-disc text-neutral-600 dark:text-neutral-400">
            <li>Continue current productivity initiatives</li>
            <li>Expand knowledge base documentation</li>
            <li>Support pending projects to reach completion</li>
          </ul>
        </section>
      </div>

      <div className="text-center text-2xs text-neutral-500 mt-auto">Page 14</div>
    </div>
  );
}

function FooterPage() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center text-neutral-600 dark:text-neutral-400 p-12">
      <div className="space-y-6">
        <div className="text-sm">
          <p className="font-semibold mb-2">Report Information</p>
          <p>Generated: —</p>
          <p>Period: —</p>
          <p>Generated by: —</p>
        </div>

        <div className="text-xs">
          <p>This report is confidential and intended for authorized users only.</p>
          <p>For questions, contact your workspace administrator.</p>
        </div>
      </div>

      <div className="text-2xs text-neutral-500 mt-auto">Page 15 - End of Report</div>
    </div>
  );
}

function StatBox({ label, value, change }: { label: string; value: string; change: number }) {
  return (
    <div className="border-2 border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
      <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
      {change !== 0 && (
        <p className={`text-xs mt-1 font-semibold ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change > 0 ? '↑' : '↓'} {Math.abs(change)}% from last month
        </p>
      )}
    </div>
  );
}

function ProgressBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm font-semibold">{value}%</p>
      </div>
      <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent-600"
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
}

function TimelineItem({ date, title }: { date: string; title: string }) {
  return (
    <div className="flex gap-4">
      <div className="text-xs font-semibold text-accent-600 w-12 shrink-0">{date}</div>
      <div className="flex-1 pb-3 border-l-2 border-neutral-300 pl-4">
        <p className="text-sm">{title}</p>
      </div>
    </div>
  );
}
