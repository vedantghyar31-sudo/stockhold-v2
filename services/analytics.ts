import {
  collection, query, where, getDocs, Timestamp, orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Bill, TimeFilter, AnalyticsSummary, ChartPoint } from '@/types';
import { format, startOfDay, startOfWeek, startOfMonth, startOfYear, endOfDay } from 'date-fns';

export const getDateRange = (filter: TimeFilter) => {
  const now = new Date();
  const map = {
    today: { startDate: startOfDay(now),   endDate: endOfDay(now) },
    week:  { startDate: startOfWeek(now),  endDate: endOfDay(now) },
    month: { startDate: startOfMonth(now), endDate: endOfDay(now) },
    year:  { startDate: startOfYear(now),  endDate: endOfDay(now) },
  };
  return map[filter];
};

const dateLabel = (date: Date, filter: TimeFilter): string => {
  if (filter === 'today') return format(date, 'hh:mm a');
  if (filter === 'week')  return format(date, 'EEE dd');
  if (filter === 'month') return format(date, 'MMM dd');
  return format(date, 'MMM yyyy');
};

const getBillsInRange = async (uid: string, start: Date, end: Date): Promise<Bill[]> => {
  const snap = await getDocs(
    query(
      collection(db, `users/${uid}/bills`),
      where('createdAt', '>=', Timestamp.fromDate(start)),
      where('createdAt', '<=', Timestamp.fromDate(end)),
      orderBy('createdAt', 'desc')
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Bill));
};

export const getAnalytics = async (uid: string, filter: TimeFilter): Promise<AnalyticsSummary> => {
  const { startDate, endDate } = getDateRange(filter);
  const bills = await getBillsInRange(uid, startDate, endDate);

  // Build chart data map
  const map = new Map<string, ChartPoint>();
  bills.forEach((b) => {
    const d   = b.createdAt?.toDate ? b.createdAt.toDate() : new Date();
    const key = dateLabel(d, filter);
    const ex  = map.get(key) || { date: key, revenue: 0, profit: 0 };
    map.set(key, { date: key, revenue: ex.revenue + b.totalAmount, profit: ex.profit + b.paidAmount });
  });

  const chartData = Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalRevenue:    bills.reduce((s, b) => s + b.totalAmount,     0),
    totalProfit:     bills.reduce((s, b) => s + b.paidAmount,      0),
    totalBills:      bills.length,
    paidBills:       bills.filter((b) => b.paymentStatus === 'successful').length,
    pendingBills:    bills.filter((b) => b.paymentStatus === 'pending').length,
    halfPaidBills:   bills.filter((b) => b.paymentStatus === 'half_paid').length,
    returnedBills:   bills.filter((b) => b.paymentStatus === 'returned').length,
    collectedAmount: bills.reduce((s, b) => s + b.paidAmount,      0),
    pendingAmount:   bills.reduce((s, b) => s + b.remainingAmount,  0),
    chartData,
  };
};
