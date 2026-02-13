export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type MonitorMode = 'manufacturing' | 'molding';

export interface DateFilter {
  startDate?: string;
  endDate?: string;
  selectedYear?: number;
  selectedMonth?: number;
  selectedWeek?: number;
  selectedMonths?: number[];
}

export interface ManufacturingMetric {
  loadRate: number;
  batchCount: number;
  productionVolume: number;
  volumeLoadRate?: number;
  maxCapacity?: number;
}

export interface TrendData {
  time: string;
  loadRate: number;
  volumeLoadRate?: number;
}

export interface EquipmentLoad {
  type: string;
  groupName: string;
  loadRate: number;
  volumeLoadRate?: number;
  batchCount: number;
  trends: TrendData[];
}

export interface CategoryData extends ManufacturingMetric {
  id: string;
  name: string;
  equipmentLoads: EquipmentLoad[];
  trends: TrendData[];
}

export enum CategoryType {
  BASIC_TOTAL = '기초(전체)',
  BASIC_HWASEONG = '기초(화성)',
  BASIC_PYEONGTAEK = '기초(평택)',
  POWDER_TOTAL = '파우더(전체)',
  POWDER_HWASEONG = '파우더(화성)',
  POWDER_PYEONGTAEK = '파우더(평택)',
  LIP_MASCARA = '립/마스카라',
  LIPSTICK = '립스틱',
  MASCARA = '마스카라',
  MOLDING_POWDER_TOTAL = '파우더(전체) ',
  MOLDING_HWASEONG = '화성(성형)',
  MOLDING_PYEONGTAEK = '평택(성형)',
  MOLDING_LIPSTICK = '립스틱 ',
  MOLDING_MASCARA = '마스카라 '
}
