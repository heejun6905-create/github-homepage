import React, { useMemo, useState, useEffect } from 'react';
import { CategoryData, MonitorMode, TimePeriod, DateFilter } from '../types';
import { generateMockData } from '../constants';
import { ArrowLeft, Factory, TrendingUp, LayoutGrid, CheckCircle2, Zap, ChevronRight, ChevronDown, Filter } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, LabelList
} from 'recharts';

interface DetailViewProps {
  data: CategoryData;
  mode: MonitorMode;
  onBack: () => void;
}

const DetailView: React.FC<DetailViewProps> = ({ data: initialData, mode, onBack }) => {
  const [localPeriod, setLocalPeriod] = useState<TimePeriod>('weekly');
  const [currentData, setCurrentData] = useState<CategoryData>(initialData);
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['교반공정']);

  const [filter, setFilter] = useState<DateFilter>(() => {
    const now = new Date();
    const start = new Date(); start.setDate(now.getDate() - 7);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
      selectedYear: now.getFullYear(),
      selectedMonth: now.getMonth() + 1,
      selectedMonths: [now.getMonth() + 1]
    };
  });

  const isMolding = mode === 'molding';
  const groupColors: Record<string, string> = {
    '교반공정': '#6366f1', '충진공정': '#8b5cf6', '포장공정': '#ec4899', '검사공정': '#f59e0b', '출하공정': '#10b981'
  };

  useEffect(() => {
    const freshData = generateMockData(localPeriod, mode, filter);
    const matched = freshData.find(d => d.name === initialData.name);
    if (matched) {
      setCurrentData(matched);
      if (selectedEquipments.length === 0) {
        setSelectedEquipments([matched.equipmentLoads[0].type]);
      }
    }
  }, [localPeriod, mode, filter, initialData.name]);

  const stats = useMemo(() => {
    const peak = [...currentData.equipmentLoads].sort((a, b) => b.loadRate - a.loadRate)[0];
    return {
      peakName: peak?.type || 'N/A',
      peakValue: peak?.loadRate || 0
    };
  }, [currentData]);

  const aggregatedTypeData = useMemo(() => {
    const groups: Record<string, { total: number, count: number }> = {};
    currentData.equipmentLoads.forEach(eq => {
      if (!groups[eq.groupName]) groups[eq.groupName] = { total: 0, count: 0 };
      groups[eq.groupName].total += eq.loadRate;
      groups[eq.groupName].count += 1;
    });
    return Object.entries(groups).map(([name, stat]) => ({
      name, avgLoad: Math.round(stat.total / stat.count)
    }));
  }, [currentData]);

  const combinedTrends = useMemo(() => {
    if (!currentData.equipmentLoads[0]?.trends) return [];
    return currentData.equipmentLoads[0].trends.map((t, i) => {
      const entry: any = { time: t.time };
      currentData.equipmentLoads.forEach(eq => {
        if (selectedEquipments.includes(eq.type)) {
          entry[eq.type] = eq.trends[i]?.loadRate || 0;
        }
      });
      return entry;
    });
  }, [currentData, selectedEquipments]);

  const toggleMonth = (m: number) => {
    setFilter(prev => ({
      ...prev,
      selectedMonths: prev.selectedMonths?.includes(m)
        ? prev.selectedMonths.filter(x => x !== m)
        : [...(prev.selectedMonths || []), m]
    }));
  };

  const renderDetailFilter = () => {
    return (
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-xl">
           <Filter className="w-3.5 h-3.5 text-indigo-600" />
           <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">세부 분석 옵션</span>
        </div>

        {localPeriod === 'daily' && (
          <div className="flex items-center gap-2">
            <input type="date" value={filter.startDate} onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
              className="text-xs font-bold border-none bg-slate-100 rounded-lg px-2 py-1 outline-none" />
            <span className="text-slate-400 font-bold">~</span>
            <input type="date" value={filter.endDate} onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
              className="text-xs font-bold border-none bg-slate-100 rounded-lg px-2 py-1 outline-none" />
          </div>
        )}

        {localPeriod === 'weekly' && (
          <div className="flex items-center gap-2">
            <select value={filter.selectedYear} onChange={(e) => setFilter({ ...filter, selectedYear: parseInt(e.target.value) })}
              className="text-xs font-bold bg-slate-100 rounded-lg px-3 py-1 outline-none">
              {[2023, 2024, 2025].map(y => <option key={y} value={y}>{y}년</option>)}
            </select>
            <select value={filter.selectedMonth} onChange={(e) => setFilter({ ...filter, selectedMonth: parseInt(e.target.value) })}
              className="text-xs font-bold bg-slate-100 rounded-lg px-3 py-1 outline-none">
              {Array.from({ length: 12 }).map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}월</option>)}
            </select>
            <span className="text-[10px] font-black text-slate-400 ml-1">(해당 월 주차별 자동 분석)</span>
          </div>
        )}

        {localPeriod === 'monthly' && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <select value={filter.selectedYear} onChange={(e) => setFilter({ ...filter, selectedYear: parseInt(e.target.value) })}
              className="text-xs font-bold bg-slate-100 rounded-lg px-3 py-1 outline-none mr-2">
              {[2023, 2024, 2025].map(y => <option key={y} value={y}>{y}년</option>)}
            </select>
            {Array.from({ length: 12 }).map((_, i) => (
              <button key={i + 1} onClick={() => toggleMonth(i + 1)}
                className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all border ${filter.selectedMonths?.includes(i + 1) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200'}`}>
                {i + 1}월
              </button>
            ))}
          </div>
        )}

        {localPeriod === 'yearly' && (
          <div className="flex items-center gap-2">
            <select value={filter.selectedYear} onChange={(e) => setFilter({ ...filter, selectedYear: parseInt(e.target.value) })}
              className="text-xs font-bold bg-slate-100 rounded-lg px-3 py-1 outline-none">
              {[2023, 2024, 2025].map(y => <option key={y} value={y}>{y}년</option>)}
            </select>
             <span className="text-[10px] font-black text-slate-400 ml-1">(선택한 연도의 월별 추이 분석)</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white rounded-full transition-colors border border-slate-200 shadow-sm">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{currentData.name.trim()} 분석 대시보드</h2>
            <p className="text-xs font-bold text-slate-400">데이터 기반 커스텀 기간 정밀 분석</p>
          </div>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
          {(['daily', 'weekly', 'monthly', 'yearly'] as TimePeriod[]).map((p) => (
            <button key={p} onClick={() => setLocalPeriod(p)}
              className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${localPeriod === p ? 'bg-white text-slate-900 shadow-md ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}>
              {p === 'daily' ? '일' : p === 'weekly' ? '주' : p === 'monthly' ? '월' : '연'}
            </button>
          ))}
        </div>
      </div>

      {renderDetailFilter()}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: isMolding ? '성형 부하율' : '제조 부하율', value: `${currentData.loadRate}%`, color: isMolding ? 'text-teal-600' : 'text-blue-600' },
          { label: '전체 설비 가동수', value: '35 / 35', color: 'text-slate-700' },
          { label: isMolding ? '생산 수량' : '배치수', value: `${currentData.batchCount.toLocaleString()}`, subValue: ` / Max ${currentData.maxCapacity?.toLocaleString()} ea`, color: 'text-emerald-600' },
          { label: '최대 부하 집중 설비', value: stats.peakName, subValue: `(${stats.peakValue}%)`, color: 'text-orange-600' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-2">{stat.label}</p>
            <div className="flex items-baseline gap-1 flex-wrap">
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              {stat.subValue && <span className="text-xs font-bold text-slate-400">{stat.subValue}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-[740px]">
          <div className="p-6 border-b border-slate-100 bg-slate-50/30">
            <h3 className="font-black text-slate-800 flex items-center gap-2"><LayoutGrid className="w-5 h-5 text-indigo-600" />분석 설비 선택 (35대)</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {Object.entries(groupColors).map(([groupName, color]) => (
              <div key={groupName} className="border border-slate-100 rounded-2xl overflow-hidden">
                <button onClick={() => setExpandedGroups(prev => prev.includes(groupName) ? prev.filter(g => g !== groupName) : [...prev, groupName])}
                  className="w-full p-4 flex items-center justify-between transition-colors hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-6 rounded-full" style={{ backgroundColor: color }}></div>
                    <span className="font-black text-slate-700 text-sm">{groupName}</span>
                  </div>
                  {expandedGroups.includes(groupName) ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </button>
                {expandedGroups.includes(groupName) && (
                  <div className="p-4 grid grid-cols-2 gap-2 bg-white border-t border-slate-50">
                    {currentData.equipmentLoads.filter(eq => eq.groupName === groupName).map(eq => (
                      <button key={eq.type} onClick={() => setSelectedEquipments(prev => prev.includes(eq.type) ? prev.filter(t => t !== eq.type) : [...prev, eq.type])}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${selectedEquipments.includes(eq.type) ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}>
                        {eq.type}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-[320px] flex flex-col">
            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2"><Factory className="w-5 h-5 text-emerald-600" />공정 유형별 평균 부하 현황</h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aggregatedTypeData} margin={{ top: 25, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="avgLoad" radius={[12, 12, 0, 0]} barSize={45}>
                    <LabelList
                      dataKey="avgLoad"
                      position="top"
                      formatter={(val: number) => `${Math.round(val)}%`}
                      style={{ fill: '#334155', fontSize: '12px', fontWeight: '800' }}
                    />
                    {aggregatedTypeData.map((entry, index) => <Cell key={`cell-${index}`} fill={groupColors[entry.name]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-[400px] flex flex-col">
            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-indigo-600" />설비별 부하 추이 분석</h3>
            <div className="flex-1 w-full">
              {selectedEquipments.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={combinedTrends} margin={{ top: 25, right: 15, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} unit="%" />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    {selectedEquipments.map((type) => {
                      const eq = currentData.equipmentLoads.find(e => e.type === type);
                      const color = groupColors[eq?.groupName || '교반공정'];
                      return (
                        <Line
                          key={type}
                          type="monotone"
                          dataKey={type}
                          stroke={color}
                          strokeWidth={2.5}
                          dot={{ r: 3, fill: color, strokeWidth: 0 }}
                          activeDot={{ r: 5 }}
                        >
                          <LabelList
                            dataKey={type}
                            position="top"
                            offset={10}
                            style={{
                              fill: color,
                              fontSize: '10px',
                              fontWeight: '700',
                              paintOrder: 'stroke',
                              stroke: '#fff',
                              strokeWidth: '3px'
                            }}
                            formatter={(val: number) => `${Math.round(val)}%`}
                          />
                        </Line>
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                  <p className="font-bold">분석할 설비를 왼쪽 리스트에서 선택하세요</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailView;
