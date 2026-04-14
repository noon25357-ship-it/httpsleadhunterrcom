import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Lead } from "@/lib/leadData";
import type { SavedLead, LeadStatus, LastAction, ContactChannel } from "@/lib/leadStatuses";

export function useLeadManager(userId: string | undefined) {
  const [savedLeads, setSavedLeads] = useState<SavedLead[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSavedLeads = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from("saved_leads")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    setSavedLeads((data as SavedLead[]) || []);
    setLoading(false);
  }, [userId]);

  const saveLead = useCallback(async (lead: Lead) => {
    if (!userId) return;
    // Check if already saved
    const existing = savedLeads.find(
      (s) => (s.lead_data as any)?.id === lead.id
    );
    if (existing) {
      toast.info("الليد محفوظ مسبقاً");
      return existing;
    }

    const { data, error } = await supabase
      .from("saved_leads")
      .insert({
        user_id: userId,
        lead_data: lead as any,
        status: "new" as any,
        last_action: "saved" as any,
        last_action_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      toast.error("خطأ في حفظ الليد");
      return null;
    }
    toast.success("تم حفظ الليد ✅");
    await fetchSavedLeads();
    return data;
  }, [userId, savedLeads, fetchSavedLeads]);

  const updateLeadStatus = useCallback(async (leadId: string, status: LeadStatus) => {
    const { error } = await supabase
      .from("saved_leads")
      .update({
        status: status as any,
        last_action: "status_changed" as any,
        last_action_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", leadId);

    if (error) {
      toast.error("خطأ في تحديث الحالة");
      return;
    }
    toast.success("تم تحديث الحالة");
    await fetchSavedLeads();
  }, [fetchSavedLeads]);

  const markAsContacted = useCallback(async (leadId: string, channel: ContactChannel) => {
    const { error } = await supabase
      .from("saved_leads")
      .update({
        status: "contacted" as any,
        last_action: "message_sent" as any,
        contact_channel: channel as any,
        last_action_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", leadId);

    if (error) {
      toast.error("خطأ في تحديث الحالة");
      return;
    }
    await fetchSavedLeads();
  }, [fetchSavedLeads]);

  const deleteLead = useCallback(async (leadId: string) => {
    await supabase.from("saved_leads").delete().eq("id", leadId);
    toast.success("تم الحذف");
    await fetchSavedLeads();
  }, [fetchSavedLeads]);

  // Helper to check if a lead is saved
  const getLeadStatus = useCallback((leadId: string): SavedLead | undefined => {
    return savedLeads.find((s) => (s.lead_data as any)?.id === leadId);
  }, [savedLeads]);

  return {
    savedLeads,
    loading,
    fetchSavedLeads,
    saveLead,
    updateLeadStatus,
    markAsContacted,
    deleteLead,
    getLeadStatus,
  };
}
