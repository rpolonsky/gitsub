export const diffDays = (date1: Date, date2: Date) => {
  const diffTime: number = Math.abs((date2 as any) - (date1 as any));

  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};
