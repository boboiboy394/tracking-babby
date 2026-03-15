import { format, parseISO, differenceInMonths, differenceInYears } from 'date-fns';

export const formatDate = (date: string | Date, formatStr = 'dd/MM/yyyy'): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
};

export const getAgeString = (birthDate: string): string => {
  const birth = parseISO(birthDate);
  const now = new Date();
  const years = differenceInYears(now, birth);
  const months = differenceInMonths(now, birth) % 12;

  if (years === 0) {
    return `${months} tháng tuổi`;
  }
  if (months === 0) {
    return `${years} tuổi`;
  }
  return `${years} tuổi ${months} tháng`;
};
