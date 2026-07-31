import { useId } from 'react';
import { cn } from '../../lib/cn';

export interface ChartData {
  id?: string;
  label: string;
  value: number;
  color?: string;
  percentage?: number;
}

export interface BarChartProps {
  data: { label: string; value: number }[];
  height?: number;
  tone?: 'accent' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const toneFill: Record<string, string> = {
  accent: 'rgb(var(--accent-500))',
  success: 'rgb(var(--success-500))',
  warning: 'rgb(var(--warning-500))',
  danger: 'rgb(var(--danger-500))',
  info: 'rgb(var(--info-500))',
};

export function BarChart({ data, height = 200, tone = 'accent', className }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const barWidth = 100 / data.length;
  return (
    <div className={cn('w-full', className)}>
      <svg role="img" aria-label={`Bar chart showing ${data.map(d => `${d.label}: ${d.value}`).join(', ')}`} viewBox={`0 0 100 ${height / 2}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
        {data.map((d, i) => {
          const h = (d.value / max) * (height / 2 - 16);
          const x = i * barWidth + barWidth * 0.2;
          const w = barWidth * 0.6;
          return (
            <rect
              key={i}
              x={x}
              y={height / 2 - h - 12}
              width={w}
              height={Math.max(0, h)}
              fill={toneFill[tone]}
              rx={0.5}
              opacity={0.9}
            >
              <animate attributeName="height" from="0" to={Math.max(0, h)} dur="0.5s" fill="freeze" />
              <animate attributeName="y" from={height / 2 - 12} to={height / 2 - h - 12} dur="0.5s" fill="freeze" />
            </rect>
          );
        })}
      </svg>
      <div className="mt-2 flex justify-between">
        {data.map((d, i) => (
          <span key={i} className="text-2xs text-text-tertiary truncate" style={{ width: `${barWidth}%` }}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export interface LineChartProps {
  data: { label: string; value: number }[];
  height?: number;
  tone?: 'accent' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function LineChart({ data, height = 200, tone = 'accent', className }: LineChartProps) {
  const gradId = useId();
  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value), 0);
  const range = max - min || 1;
  const w = 100;
  const h = height / 2;
  const pad = 8;
  const stepX = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0;

  const points = data.map((d, i) => {
    const x = pad + i * stepX;
    const y = h - pad - ((d.value - min) / range) * (h - pad * 2);
    return [x, y] as const;
  });

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
  const areaPath = `${path} L ${points[points.length - 1]?.[0] ?? pad} ${h - pad} L ${points[0]?.[0] ?? pad} ${h - pad} Z`;

  return (
    <div className={cn('w-full', className)}>
      <svg role="img" aria-label={`Line chart showing ${data.map(d => `${d.label}: ${d.value}`).join(', ')}`} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={toneFill[tone]} stopOpacity="0.18" />
            <stop offset="100%" stopColor={toneFill[tone]} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradId})`} />
        <path d={path} fill="none" stroke={toneFill[tone]} strokeWidth={0.6} strokeLinecap="round" strokeLinejoin="round">
          <animate attributeName="stroke-dasharray" from="0 300" to="300 0" dur="0.8s" fill="freeze" />
        </path>
        {points.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={0.8} fill={toneFill[tone]} />
        ))}
      </svg>
      <div className="mt-2 flex justify-between">
        {data.map((d, i) => (
          <span key={i} className="text-2xs text-text-tertiary">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export interface AreaChartProps extends LineChartProps {}

export function AreaChart(props: AreaChartProps) {
  return <LineChart {...props} />;
}

export interface PieChartProps {
  data: { label: string; value: number; tone?: 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' }[];
  size?: number;
  className?: string;
}

const pieColors: Record<string, string> = {
  accent: 'rgb(var(--accent-500))',
  success: 'rgb(var(--success-500))',
  warning: 'rgb(var(--warning-500))',
  danger: 'rgb(var(--danger-500))',
  info: 'rgb(var(--info-500))',
  neutral: 'rgb(var(--border-strong))',
};

export function PieChart({ data, size = 160, className }: PieChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = 40;
  const cx = 50;
  const cy = 50;
  let cumulative = 0;

  const segments = data.map((d) => {
    const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    cumulative += d.value;
    const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    return {
      path: `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: pieColors[d.tone ?? 'neutral'],
      label: d.label,
      pct: Math.round((d.value / total) * 100),
    };
  });

  return (
    <div className={cn('flex items-center gap-6', className)}>
      <svg role="img" aria-label={`Pie chart showing ${data.map(d => `${d.label}: ${Math.round((d.value / total) * 100)}%`).join(', ')}`} viewBox="0 0 100 100" style={{ width: size, height: size }} className="shrink-0">
        {segments.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} opacity={0.9} stroke="rgb(var(--bg-elevated))" strokeWidth={0.5} />
        ))}
      </svg>
      <div className="flex flex-col gap-2 min-w-0">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-caption text-text-secondary truncate">{s.label}</span>
            <span className="text-caption font-medium text-text-tertiary ml-auto">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export interface ActivityChartProps {
  data: { date: string; value: number }[];
  height?: number;
  className?: string;
}

export function ActivityChart({ data, height = 120, className }: ActivityChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const cellSize = 12;
  const gap = 3;
  const weeks = Math.ceil(data.length / 7);

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <svg
        width={weeks * (cellSize + gap)}
        height={7 * (cellSize + gap)}
        className="block"
      >
        {data.map((d, i) => {
          const col = Math.floor(i / 7);
          const row = i % 7;
          const intensity = d.value / max;
          const opacity = d.value === 0 ? 0.08 : 0.2 + intensity * 0.8;
          return (
            <rect
              key={i}
              x={col * (cellSize + gap)}
              y={row * (cellSize + gap)}
              width={cellSize}
              height={cellSize}
              rx={2}
              fill="rgb(var(--accent-500))"
              opacity={opacity}
            >
              <title>{`${d.date}: ${d.value}`}</title>
            </rect>
          );
        })}
      </svg>
    </div>
  );
}
