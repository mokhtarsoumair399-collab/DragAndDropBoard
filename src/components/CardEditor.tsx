import { FormEvent, useEffect, useId, useState } from "react";
import { Check, X } from "lucide-react";
import type { CardDraft, Priority } from "../types";
import { cn } from "../lib/utils";

// The editor owns the display labels and color dots for priority choices.
// The actual saved value is the Priority union value, such as "high".
const priorities: Array<{ value: Priority; label: string; className: string }> = [
  { value: "low", label: "Low", className: "bg-emerald-500" },
  { value: "medium", label: "Medium", className: "bg-sky-500" },
  { value: "high", label: "High", className: "bg-amber-500" },
  { value: "urgent", label: "Urgent", className: "bg-rose-500" },
];

type CardEditorProps = {
  mode: "add" | "edit";
  initialValue?: CardDraft;
  onCancel: () => void;
  onSubmit: (draft: CardDraft) => void;
};

// Default state used when creating a new card.
const emptyDraft: CardDraft = {
  title: "",
  description: "",
  priority: "medium",
};

// CardEditor is reused for both adding and editing. The parent decides what
// happens on submit, while this component only manages form fields.
export function CardEditor({ mode, initialValue, onCancel, onSubmit }: CardEditorProps) {
  // useId creates stable, unique ids for label/input relationships. That keeps
  // the form accessible even if many editors exist on the page.
  const titleId = useId();
  const descriptionId = useId();
  const [draft, setDraft] = useState<CardDraft>(initialValue ?? emptyDraft);

  // When switching from one edited card to another, refresh the local form
  // state from the latest prop values.
  useEffect(() => {
    setDraft(initialValue ?? emptyDraft);
  }, [initialValue]);

  // A title is the only required field. trim prevents whitespace-only cards.
  const canSubmit = draft.title.trim().length > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Prevent the browser from doing a full page reload on form submit.
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit(draft);
    // After creating a card, clear the form in case the parent keeps it open in
    // the future. Edit mode closes from the parent after saving.
    if (mode === "add") setDraft(emptyDraft);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900"
    >
      <div className="space-y-2">
        <label className="sr-only" htmlFor={titleId}>
          Card title
        </label>
        <input
          id={titleId}
          value={draft.title}
          onChange={(event) => setDraft((value) => ({ ...value, title: event.target.value }))}
          autoFocus
          placeholder="Card title"
          className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-gray-950 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50 dark:focus:border-gray-500 dark:focus:ring-gray-800"
        />
        <label className="sr-only" htmlFor={descriptionId}>
          Description
        </label>
        <textarea
          id={descriptionId}
          value={draft.description}
          onChange={(event) => setDraft((value) => ({ ...value, description: event.target.value }))}
          placeholder="Description"
          rows={3}
          className="w-full resize-none rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:focus:border-gray-500 dark:focus:ring-gray-800"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {priorities.map((priority) => (
          <button
            key={priority.value}
            type="button"
            onClick={() => setDraft((value) => ({ ...value, priority: priority.value }))}
            className={cn(
              "inline-flex h-8 items-center gap-2 rounded-md border px-2.5 text-xs font-medium transition",
              draft.priority === priority.value
                ? "border-gray-950 bg-gray-950 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-950"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600",
            )}
          >
            {/* The dot gives a quick visual cue without relying only on text. */}
            <span className={cn("h-2 w-2 rounded-full", priority.className)} />
            {priority.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          aria-label="Cancel"
          title="Cancel"
        >
          <X className="h-4 w-4" />
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gray-950 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-100 dark:text-gray-950 dark:hover:bg-white"
          aria-label={mode === "add" ? "Add card" : "Save card"}
          title={mode === "add" ? "Add card" : "Save card"}
        >
          <Check className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
