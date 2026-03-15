import { supabase } from './supabase';
import { TrackingRecord, RecordType, RecordData } from '../types';

export const trackingService = {
  async getRecords(
    childId: string,
    options?: {
      type?: RecordType;
      dateFrom?: string;
      dateTo?: string;
      limit?: number;
    }
  ): Promise<TrackingRecord[]> {
    let query = supabase
      .from('tracking_records')
      .select('*')
      .eq('child_id', childId)
      .order('record_date', { ascending: false });

    if (options?.type) {
      query = query.eq('record_type', options.type);
    }

    if (options?.dateFrom) {
      query = query.gte('record_date', options.dateFrom);
    }

    if (options?.dateTo) {
      query = query.lte('record_date', options.dateTo);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async addRecord(
    childId: string,
    recordType: RecordType,
    data: RecordData,
    notes?: string,
    recordDate?: string
  ): Promise<TrackingRecord> {
    const { data: record, error } = await supabase
      .from('tracking_records')
      .insert({
        child_id: childId,
        record_type: recordType,
        data,
        notes: notes || null,
        record_date: recordDate || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return record;
  },

  async updateRecord(
    id: string,
    data: Partial<{ data: RecordData; notes: string; record_date: string }>
  ): Promise<void> {
    const { error } = await supabase
      .from('tracking_records')
      .update(data)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteRecord(id: string): Promise<void> {
    const { error } = await supabase
      .from('tracking_records')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getGrowthHistory(childId: string, limit = 12): Promise<TrackingRecord[]> {
    return this.getRecords(childId, { type: 'growth', limit });
  },

  async getFeedingHistory(childId: string, limit = 30): Promise<TrackingRecord[]> {
    return this.getRecords(childId, { type: 'feeding', limit });
  },

  async getMilestones(childId: string): Promise<TrackingRecord[]> {
    return this.getRecords(childId, { type: 'milestone' });
  },

  async getVaccinations(childId: string): Promise<TrackingRecord[]> {
    return this.getRecords(childId, { type: 'vaccination' });
  },
};
