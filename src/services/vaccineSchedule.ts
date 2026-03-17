import { addMonths, addYears, format } from 'date-fns';
import { vi } from 'date-fns/locale';

export interface VaccineScheduleItem {
  name: string;
  age: number; // months
  vaccines: string[];
  description: string;
}

// Vietnam standard vaccination schedule (based on Ministry of Health)
export const VIETNAM_VACCINE_SCHEDULE: VaccineScheduleItem[] = [
  {
    name: 'Sơ sinh',
    age: 0,
    vaccines: ['BCG', 'Viêm gan B'],
    description: 'Trong 24h sau sinh',
  },
  {
    name: '2 tháng',
    age: 2,
    vaccines: ['Pentaxim 1', 'Rotateq 1', 'Prevenar 1'],
    description: 'Mũi 1',
  },
  {
    name: '3 tháng',
    age: 3,
    vaccines: ['Pentaxim 2', 'Rotateq 2'],
    description: 'Mũi 2',
  },
  {
    name: '4 tháng',
    age: 4,
    vaccines: ['Pentaxim 3', 'Rotateq 3', 'Prevenar 2'],
    description: 'Mũi 3',
  },
  {
    name: '5 tháng',
    age: 5,
    vaccines: ['Prevenar 3'],
    description: 'Mũi 3',
  },
  {
    name: '6 tháng',
    age: 6,
    vaccines: ['Viêm gan B', 'Sởi 1'],
    description: 'Mũi nhắc + Sởi',
  },
  {
    name: '7 tháng',
    age: 7,
    vaccines: ['Sởi 2'],
    description: 'Mũi nhắc Sởi',
  },
  {
    name: '9 tháng',
    age: 9,
    vaccines: ['Sởi - Quai bà'],
    description: 'Sởi - Quai bà',
  },
  {
    name: '12 tháng',
    age: 12,
    vaccines: ['Thủy đậu 1', 'Cúm 1'],
    description: 'Thủy đậu mũi 1',
  },
  {
    name: '13 tháng',
    age: 13,
    vaccines: ['Thủy đậu 2'],
    description: 'Thủy đậu mũi 2',
  },
  {
    name: '15 tháng',
    age: 15,
    vaccines: ['Sởi - Quai bà - Thủy đậu (MMRV)'],
    description: 'MMRV',
  },
  {
    name: '18 tháng',
    age: 18,
    vaccines: ['Dại 1', 'Viêm não Nhật Bản 1'],
    description: 'Mũi nhắc',
  },
  {
    name: '24 tháng',
    age: 24,
    vaccines: ['Dại 2'],
    description: 'Mũi nhắc Dại',
  },
  {
    name: '4 tuổi',
    age: 48,
    vaccines: ['Sởi - Quai bà - Thủy đậu (MMRV)'],
    description: 'MMRV nhắc',
  },
  {
    name: '5 tuổi',
    age: 60,
    vaccines: ['Dại nhắc', 'Viêm não Nhật Bản nhắc'],
    description: 'Mũi nhắc',
  },
  {
    name: '10 tuổi',
    age: 120,
    vaccines: ['Uốn ván', 'Bạch hầu', 'Ho gà'],
    description: 'Td (Tetax diphtheria pertussis)',
  },
];

export const vaccineService = {
  /**
   * Get all vaccines with their scheduled dates based on child's birth date
   */
  getSchedule(birthDate: Date): { item: VaccineScheduleItem; scheduledDate: Date }[] {
    return VIETNAM_VACCINE_SCHEDULE.map((item) => {
      const scheduledDate = addMonths(birthDate, item.age);
      return {
        item,
        scheduledDate,
      };
    });
  },

  /**
   * Get next upcoming vaccine based on birth date and vaccination history
   */
  getNextVaccine(
    birthDate: Date,
    vaccinatedVaccines: string[] // List of vaccines already given
  ): { item: VaccineScheduleItem; scheduledDate: Date; daysUntil: number } | null {
    const schedule = this.getSchedule(birthDate);
    const now = new Date();

    for (const { item, scheduledDate } of schedule) {
      // Check if any vaccine in this schedule is not yet given
      const neededVaccines = item.vaccines.filter(
        (v) => !vaccinatedVaccines.some((vv) => vv.toLowerCase().includes(v.toLowerCase()))
      );

      if (neededVaccines.length > 0) {
        const daysUntil = Math.ceil((scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return {
          item: { ...item, vaccines: neededVaccines },
          scheduledDate,
          daysUntil,
        };
      }
    }

    return null;
  },

  /**
   * Get all upcoming vaccines within next N days
   */
  getUpcomingVaccines(
    birthDate: Date,
    vaccinatedVaccines: string[],
    daysAhead: number = 30
  ): { item: VaccineScheduleItem; scheduledDate: Date; daysUntil: number }[] {
    const schedule = this.getSchedule(birthDate);
    const now = new Date();
    const result: { item: VaccineScheduleItem; scheduledDate: Date; daysUntil: number }[] = [];

    for (const { item, scheduledDate } of schedule) {
      const neededVaccines = item.vaccines.filter(
        (v) => !vaccinatedVaccines.some((vv) => vv.toLowerCase().includes(v.toLowerCase()))
      );

      if (neededVaccines.length > 0) {
        const daysUntil = Math.ceil((scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil >= 0 && daysUntil <= daysAhead) {
          result.push({
            item: { ...item, vaccines: neededVaccines },
            scheduledDate,
            daysUntil,
          });
        }
      }
    }

    return result.sort((a, b) => a.daysUntil - b.daysUntil);
  },

  /**
   * Format vaccine date for display
   */
  formatDate(date: Date): string {
    return format(date, 'dd MMMM yyyy', { locale: vi });
  },

  /**
   * Get vaccine status text
   */
  getStatusText(daysUntil: number): string {
    if (daysUntil < 0) {
      return `Quá ${Math.abs(daysUntil)} ngày`;
    } else if (daysUntil === 0) {
      return 'Hôm nay';
    } else if (daysUntil === 1) {
      return 'Ngày mai';
    } else if (daysUntil <= 7) {
      return `Còn ${daysUntil} ngày`;
    } else if (daysUntil <= 30) {
      return `Còn ${Math.ceil(daysUntil / 7)} tuần`;
    } else {
      return `Còn ${Math.ceil(daysUntil / 30)} tháng`;
    }
  },
};
