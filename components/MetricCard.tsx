import React from 'react';
import { ManufacturingMetric, MonitorMode } from '../types';
import { Activity, BarChart3, AlertCircle } from 'lucide-react';

interface MetricCardProps extends ManufacturingMetric {
  name: string;
  mode: MonitorMode;
  onClick: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({
  name,
  loadRate,
  batchCount,
  productionVolume,
  volumeLoadRate,
  maxCapacity,
  mode,
  onClick
}) => {
  const isMolding = mode === 'molding';

  const getStatusColor = (rate: number) => {
    if (rate >= 90) return { text: 'text-red-600', bg: 'bg-red-50', bar: 'bg-red-500' };
    if (rate >= 75) return { text: 'text-amber-600', bg: 'bg-amber-50', bar: 'bg-amber-500' };
    return {
      text: isMolding ? 'text-teal-600' : 'text-emerald-600',
      bg: isMolding ? 'bg-teal-50' : 'bg-emerald-50',
      bar: isMolding ? 'bg-teal-500' : 'bg-emerald-500'
    };
  };

  const status = getStatusColor(loadRate);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className={`font-extrabold text-slate-800 text-lg group-hover:${isMolding ? 'text-teal-600' : 'text-indigo-600'} transition-colors leading-tight`}>
              {name.trim()}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${status.bg} ${status.text}`}>
                {loadRate >= 90 ? 'Critical' : loadRate >= 75 ? 'Warning' : 'Normal'}
              </span>
              {loadRate >= 90 && <AlertCircle className="w-3.5 h-3.5 text-red-500 animate-pulse" />}
            </div>
          </div>
          <Activity className={`w-5 h-5 text-slate-300 group-hover:${isMolding ? 'text-teal-500' : 'text-indigo-500'} transition-colors`} />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-end">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {isMolding ? '성형 부하율' : '제조 부하율'}
            </span>
            <span className={`text-xl font-black ${status.text}`}>{loadRate}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${status.bar}`}
              style={{ width: `${loadRate}%` }}
            />
          </div>
        </div>

        <div className={`grid ${isMolding ? 'grid-cols-1' : 'grid-cols-2'} gap-3 pt-1`}>
          {!isMolding && (
            <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100">
              <p className="text-[10px] text-slate-500 font-bold mb-0.5 uppercase tracking-tighter">제조량 부하</p>
              <p className="text-sm font-black text-slate-700">{volumeLoadRate}%</p>
            </div>
          )}
          <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100">
            <p className="text-[10px] text-slate-500 font-bold mb-0.5 uppercase tracking-tighter">
              {isMolding ? '생산 수량' : '배치수'}
            </p>
            <div className="flex items-baseline gap-1">
              <p className="text-sm font-black text-slate-700">{batchCount.toLocaleString()}</p>
              {maxCapacity && (
                <span className="text-[9px] font-bold text-slate-400">/ Max {maxCapacity.toLocaleString()}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold pt-1 border-t border-slate-50">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>총 {isMolding ? '생산' : '제조'}량: {productionVolume.toLocaleString()} unit</span>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
