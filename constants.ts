import { CategoryType, CategoryData, TimePeriod, MonitorMode, TrendData, EquipmentLoad, DateFilter } from './types';

export const MANU_CATEGORIES = [
  CategoryType.BASIC_TOTAL,
  CategoryType.BASIC_HWASEONG,
  CategoryType.BASIC_PYEONGTAEK,
  CategoryType.POWDER_TOTAL,
  CategoryType.POWDER_HWASEONG,
  CategoryType.POWDER_PYEONGTAEK,
  CategoryType.LIP_MASCARA,
  CategoryType.LIPSTICK,
  CategoryType.MASCARA,
];

export const MOLD_CATEGORIES = [
  CategoryType.MOLDING_POWDER_TOTAL,
  CategoryType.MOLDING_HWASEONG,
  CategoryType.MOLDING_PYEONGTAEK,
  CategoryType.MOLDING_LIPSTICK,
  CategoryType.MOLDING_MASCARA,
];

const generateTrend = (count: number, base: number, labels: string[]): TrendData[] => {
  return Array.from({ length: count }).map((_, i) => ({
    time: labels[i] || `${i + 1}`,
    loadRate: Math.round(Math.max(20, Math.min(100, base + (Math.random() - 0.5) * 40))),
    volumeLoadRate: Math.round(Math.max(20, Math.min(100, base - 5 + (Math.random() - 0.5) * 40))),
  }));
};

export const generateMockData = (period: TimePeriod, mode: MonitorMode, filter?: DateFilter): CategoryData[] => {
  const categories = mode === 'manufacturing' ? MANU_CATEGORIES : MOLD_CATEGORIES;
  let labels: string[] = [];
  let trendCount = 7;
  if (period === 'daily') {
    if (filter?.startDate && filter?.endDate) {
      const start = new Date(filter.startDate);
      const end = new Date(filter.endDate);
      const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      trendCount = Math.min(diff, 31);
      labels = Array.from({ length: trendCount }).map((_, i) => {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        return `${d.getMonth() + 1}/${d.getDate()}`;
      });
    } else {
      trendCount = 24;
      labels = Array.from({ length: 24 }).map((_, i) => `${i}:00`);
    }
  } else if (period === 'weekly') {
    trendCount = 5;
    labels = ['1주차', '2주차', '3주차', '4주차', '5주차'];
  } else if (period === 'monthly') {
    if (filter?.selectedMonths && filter.selectedMonths.length > 0) {
      trendCount = filter.selectedMonths.length;
      labels = filter.selectedMonths.sort((a, b) => a - b).map(m => `${m}월`);
    } else {
      trendCount = 30;
      labels = Array.from({ length: 30 }).map((_, i) => `${i + 1}일`);
    }
  } else if (period === 'yearly') {
    trendCount = 12;
    labels = Array.from({ length: 12 }).map((_, i) => `${i + 1}월`);
  }
  const EQUIPMENT_GROUPS = ['교반공정', '충진공정', '포장공정', '검사공정', '출하공정'];
  return categories.map((name, index) => {
    const baseLoad = 55 + Math.random() * 30;
    const batchCount = Math.floor(Math.random() * 800) + 200;
    const categoryTrends = generateTrend(trendCount, baseLoad, labels);
    const equipmentLoads: EquipmentLoad[] = [];
    EQUIPMENT_GROUPS.forEach((group, gIdx) => {
      for (let i = 1; i <= 7; i++) {
        const equipNum = gIdx * 7 + i;
        equipmentLoads.push({
          type: `설비 ${equipNum.toString().padStart(2, '0')}`,
          groupName: group,
          loadRate: Math.round(Math.floor(Math.random() * 40) + 45),
          batchCount: Math.floor(Math.random() * 100) + 30,
          trends: generateTrend(trendCount, baseLoad - 10, labels)
        });
      }
    });
    return {
      id: `${mode}-cat-${index}`,
      name,
      loadRate: Math.round(baseLoad),
      batchCount,
      maxCapacity: Math.floor(batchCount * 1.3),
      productionVolume: Math.floor(Math.random() * 15000) + 5000,
      volumeLoadRate: Math.round(baseLoad - 3),
      equipmentLoads,
      trends: categoryTrends,
    };
  });
};
