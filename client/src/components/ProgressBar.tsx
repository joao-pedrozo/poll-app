interface ProgressBarProps {
  percentage: number;
}

const ProgressBar = ({ percentage }: ProgressBarProps) => (
  <div className="w-full bg-slate-200 h-2">
    <div className="h-full bg-blue-500" style={{ width: `${percentage}%` }} />
  </div>
);

export default ProgressBar;
