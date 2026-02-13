import React, { useState, useEffect, useMemo } from 'react';
import { TimePeriod, CategoryData, CategoryType, MonitorMode, DateFilter } from './types';
import { generateMockData } from './constants';
import MetricCard from './components/MetricCard';
import DetailView from './components/DetailView';
import {
  Package,
  TrendingUp,
  Layers,
  Zap,
  ArrowRight,
  MapPin,
  Settings,
  Calendar
} from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<MonitorMode>('manufacturing');
  const [period, setPeriod] = useState<TimePeriod>('weekly');
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  const [data, setData] = useState<CategoryData[]>([]);

  const [filter, setFilter] = useState<DateFilter>(() => {
    const now = new Date();
    return {
      selectedYear: now.getFullYear(),
      selectedMonth: now.getMonth() + 1,
      selectedWeek: 1
    };
  });

  useEffect(() => {
    const mockData = generateMockData(period, mode, filter);
    setData(mockData);
    if (selectedCategory) {
      const updated = mockData.find(d => d.name === selectedCategory.name);
      if (updated) setSelectedCategory(updated);
    }
  }, [period, mode, filter]);

  interface GroupInfo {
    total: CategoryData | undefined;
    sub: CategoryData[];
  }

  const groups = useMemo<Record<string, GroupInfo>>(() => {
    if (mode === 'manufacturing') {
      return {
        basic: {
          total: data.find(d => d.name === CategoryType.BASIC_TOTAL),
          sub: [
            data.find(d => d.name === CategoryType.BASIC_HWASEONG),
            data.find(d => d.name === CategoryType.BASIC_PYEONGTAEK)
          ].filter(Boolean) as CategoryData[]
        },
        powder: {
          total: data.find(d => d.name === CategoryType.POWDER_TOTAL),
          sub: [
            data.find(d => d.name === CategoryType.POWDER_HWASEONG),
            data.find(d => d.name === CategoryType.POWDER_PYEONGTAEK)
          ].filter(Boolean) as CategoryData[]
        },
        point: {
          total: data.find(d => d.name === CategoryType.LIP_MASCARA),
          sub: [
            data.find(d => d.name === CategoryType.LIPSTICK),
            data.find(d => d.name === CategoryType.MASCARA)
          ].filter(Boolean) as CategoryData[]
        }
      };
    } else {
      return {
        powder: {
          total: data.find(d => d.name === CategoryType.MOLDING_POWDER_TOTAL),
          sub: [
            data.find(d => d.name === CategoryType.MOLDING_HWASEONG),
            data.find(d => d.name === CategoryType.MOLDING_PYEONGTAEK)
          ].filter(Boolean) as CategoryData[]
        },
        lipstick: {
          total: data.find(d => d.name === CategoryType.MOLDING_LIPSTICK),
          sub: []
        },
        mascara: {
          total: data.find(d => d.name === CategoryType.MOLDING_MASCARA),
          sub: []
        }
      };
    }
  }, [data, mode]);

  const stats = useMemo(() => {
    if (data.length === 0) return { avgLoad: '0', totalBatches: 0, totalMaxCapacity: 0, peakCategory: '없음', peakLoad: 0 };
    let leafData: CategoryData[] = [];
    if (mode === 'manufacturing') {
      const leafNames = [
        CategoryType.BASIC_HWASEONG, CategoryType.BASIC_PYEONGTAEK,
        CategoryType.POWDER_HWASEONG, CategoryType.POWDER_PYEONGTAEK,
        CategoryType.LIPSTICK, CategoryType.MASCARA
      ];
      leafData = data.filter(d => leafNames.includes(d.name as CategoryType));
    } else {
      const leafNames = [
        CategoryType.MOLDING_HWASEONG,
        CategoryType.MOLDING_PYEONGTAEK,
        CategoryType.MOLDING_LIPSTICK,
        CategoryType.MOLDING_MASCARA
      ];
      leafData = data.filter(d => leafNames.includes(d.name as CategoryType));
    }

    const avgLoad = leafData.length > 0 ? leafData.reduce((acc, curr) => acc + curr.loadRate, 0) / leafData.length : 0;
    const totalBatches = leafData.reduce((acc, curr) => acc + curr.batchCount, 0);
    const totalMaxCapacity = leafData.reduce((acc, curr) => acc + (curr.maxCapacity || 0), 0);
    const peak = [...leafData].sort((a, b) => b.loadRate - a.loadRate)[0];
    return {
      avgLoad: avgLoad.toFixed(1),
      totalBatches,
      totalMaxCapacity,
      peakCategory: peak ? peak.name.trim() : '없음',
      peakLoad: peak ? peak.loadRate : 0
    };
  }, [data, mode]);

  const SubItem: React.FC<{ category: CategoryData }> = ({ category }) => {
    const isHigh = category.loadRate >= 85;
    const displayName = category.name.includes('(') ? category.name.split('(')[1].replace(')', '') : category.name;

    return (
      <div
        onClick={(e) => { e.stopPropagation(); setSelectedCategory(category); }}
        className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-sm transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-500" />
          <span className="text-sm font-bold text-slate-700">{displayName}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-black ${isHigh ? 'text-orange-600' : 'text-slate-500'}`}>{category.loadRate}%</span>
          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${isHigh ? 'bg-orange-500' : 'bg-teal-400'}`}
              style={{ width: `${category.loadRate}%` }}
            />
          </div>
          <ArrowRight className="w-3 h-3 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    );
  };

  const isMolding = mode === 'molding';

  const renderFilterSelector = () => {
    if (period === 'daily') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return (
        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 shadow-inner">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-black text-slate-600">분석일: {yesterday.toLocaleDateString()} (전일 고정)</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200 shadow-inner overflow-x-auto no-scrollbar">
        <select
          value={filter.selectedYear}
          onChange={(e) => setFilter({ ...filter, selectedYear: parseInt(e.target.value) })}
          className="bg-white border-none text-xs font-black text-slate-700 px-3 py-1 rounded-xl shadow-sm cursor-pointer outline-none"
        >
          {[2023, 2024, 2025].map(y => <option key={y} value={y}>{y}년</option>)}
        </select>

        {(period === 'weekly' || period === 'monthly') && (
          <select
            value={filter.selectedMonth}
            onChange={(e) => setFilter({ ...filter, selectedMonth: parseInt(e.target.value) })}
            className="bg-white border-none text-xs font-black text-slate-700 px-3 py-1 rounded-xl shadow-sm cursor-pointer outline-none"
          >
            {Array.from({ length: 12 }).map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}월</option>)}
          </select>
        )}

        {period === 'weekly' && (
          <select
            value={filter.selectedWeek}
            onChange={(e) => setFilter({ ...filter, selectedWeek: parseInt(e.target.value) })}
            className="bg-white border-none text-xs font-black text-slate-700 px-3 py-1 rounded-xl shadow-sm cursor-pointer outline-none"
          >
            {Array.from({ length: 5 }).map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}주차</option>)}
          </select>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-20 bg-[#fbfcfd]">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className={`${isMolding ? 'bg-teal-600' : 'bg-indigo-600'} p-2 rounded-xl shadow-lg transition-colors`}>
                <Layers className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-lg font-extrabold text-slate-900 hidden sm:block">Smart Factory</h1>
            </div>

            <nav className="flex bg-slate-100 p-1 rounded-xl">
              <button onClick={() => { setMode('manufacturing'); setSelectedCategory(null); }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${!isMolding ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>제조 부하율</button>
              <button onClick={() => { setMode('molding'); setSelectedCategory(null); }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${isMolding ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500'}`}>성형 부하율</button>
            </nav>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {(['daily', 'weekly', 'monthly', 'yearly'] as TimePeriod[]).map((p) => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${period === p ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
                  {p === 'daily' ? '일' : p === 'weekly' ? '주' : p === 'monthly' ? '월' : '연'}
                </button>
              ))}
            </div>
          </div>
        </div>
        {!selectedCategory && (
          <div className="bg-white/50 backdrop-blur-md border-b border-slate-100 py-3">
            <div className="max-w-7xl mx-auto px-4 flex justify-end">
              {renderFilterSelector()}
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-8">
        {!selectedCategory ? (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl ${isMolding ? 'bg-teal-50' : 'bg-indigo-50'} flex items-center justify-center`}>
                  <TrendingUp className={`w-7 h-7 ${isMolding ? 'text-teal-600' : 'text-indigo-600'}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500">평균 {isMolding ? '성형' : '제조'} 부하율</p>
                  <p className="text-3xl font-black text-slate-800">{stats.avgLoad}%</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl ${isMolding ? 'bg-emerald-50' : 'bg-blue-50'} flex items-center justify-center`}>
                  <Package className={`w-7 h-7 ${isMolding ? 'text-emerald-600' : 'text-blue-600'}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500">총 {isMolding ? '생산' : '제조'} 수량</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-slate-800">{stats.totalBatches.toLocaleString()}</p>
                    <p className="text-sm font-bold text-slate-400">/ Max {stats.totalMaxCapacity.toLocaleString()} ea</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center">
                  <Zap className="w-7 h-7 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500">최대 부하 집중 공정</p>
                  <p className="text-xl font-black text-orange-600 leading-tight truncate">{stats.peakCategory}</p>
                  <p className="text-[10px] font-bold text-orange-400">LOAD: {stats.peakLoad}%</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {Object.entries(groups).map(([key, group]) => (
                <div key={key} className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-6 bg-slate-50/50 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl text-white ${isMolding ? 'bg-teal-600' : key === 'basic' ? 'bg-indigo-600' : key === 'powder' ? 'bg-blue-600' : 'bg-pink-600'}`}>
                        {key === 'basic' || key === 'powder' ? <Layers className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
                      </div>
                      <h2 className="text-xl font-black text-slate-800">{group.total?.name.trim()}</h2>
                    </div>
                  </div>
                  <div className="p-6 space-y-6 flex-1">
                    {group.total && (
                      <MetricCard {...group.total} mode={mode} onClick={() => setSelectedCategory(group.total!)} />
                    )}
                    {group.sub.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Regional Locations</p>
                        {group.sub.map((sub, idx) => (
                          <SubItem key={idx} category={sub} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <DetailView data={selectedCategory} mode={mode} onBack={() => setSelectedCategory(null)} />
        )}
      </main>
    </div>
  );
};

export default App;
