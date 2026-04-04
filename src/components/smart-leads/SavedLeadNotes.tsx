import { useState } from "react";
import { StickyNote, Calendar, Check } from "lucide-react";

interface SavedLeadNotesProps {
  notes: string;
  lastContact: string | null;
  nextFollowUp: string | null;
  onUpdate: (data: { notes: string; lastContact: string | null; nextFollowUp: string | null }) => void;
}

const SavedLeadNotes = ({ notes, lastContact, nextFollowUp, onUpdate }: SavedLeadNotesProps) => {
  const [open, setOpen] = useState(false);
  const [localNotes, setLocalNotes] = useState(notes);
  const [localFollowUp, setLocalFollowUp] = useState(nextFollowUp || '');

  const handleSave = () => {
    onUpdate({ notes: localNotes, lastContact, nextFollowUp: localFollowUp || null });
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
      >
        <StickyNote className="w-3 h-3" />
        {notes ? 'تعديل الملاحظات' : 'إضافة ملاحظة'}
      </button>
    );
  }

  return (
    <div className="bg-secondary/40 border border-border/50 rounded-lg p-2.5 space-y-2">
      <textarea
        value={localNotes}
        onChange={(e) => setLocalNotes(e.target.value)}
        placeholder="أضف ملاحظاتك هنا..."
        className="w-full bg-muted/50 border border-border rounded-md p-2 text-xs text-foreground placeholder:text-muted-foreground resize-none h-16 focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <div className="flex items-center gap-2">
        <Calendar className="w-3 h-3 text-muted-foreground" />
        <input
          type="date"
          value={localFollowUp}
          onChange={(e) => setLocalFollowUp(e.target.value)}
          className="bg-muted/50 border border-border rounded-md px-2 py-1 text-[10px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="موعد المتابعة"
        />
      </div>
      <div className="flex gap-2">
        <button onClick={handleSave} className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-[10px] font-bold hover:brightness-110">
          <Check className="w-3 h-3" /> حفظ
        </button>
        <button onClick={() => setOpen(false)} className="px-2.5 py-1 rounded-md bg-muted text-muted-foreground text-[10px] hover:text-foreground">
          إلغاء
        </button>
      </div>
    </div>
  );
};

export default SavedLeadNotes;
