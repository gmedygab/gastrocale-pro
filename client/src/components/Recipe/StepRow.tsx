import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Step } from "@shared/schema";

interface StepRowProps {
  step?: Step;
  number: number;
  onUpdate: (data: { id?: number; description: string }) => void;
  onDelete: () => void;
}

export default function StepRow({ step, number, onUpdate, onDelete }: StepRowProps) {
  const [description, setDescription] = useState<string>(step?.description || "");
  
  // Trigger update when description changes
  useEffect(() => {
    onUpdate({
      id: step?.id,
      description
    });
  }, [description, onUpdate, step?.id]);

  return (
    <div className="recipe-step flex items-start p-3 rounded-lg border border-neutral-200 bg-white">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-3">
        {number}
      </div>
      <div className="flex-1">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter preparation step details..."
          className="border-0 focus-visible:ring-0 p-0 min-h-[2.5rem]"
          rows={2}
        />
      </div>
      <div className="flex-shrink-0 ml-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="h-8 w-8"
        >
          <Trash2 size={16} className="text-neutral-500 hover:text-destructive" />
        </Button>
      </div>
    </div>
  );
}
