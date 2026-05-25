import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import type { Card, Priority } from "../types";
import { cn } from "../lib/utils";

// Priority values map to left-border colors. Keeping this mapping near the card
// component makes the visual treatment easy to adjust later.
const priorityStyles: Record<Priority, string> = {
  low: "border-l-emerald-500",
  medium: "border-l-sky-500",
  high: "border-l-amber-500",
  urgent: "border-l-rose-500",
};

const priorityLabels: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

type KanbanCardProps = {
  card: Card;
  // The drag overlay reuses this component, but it should not register itself
  // as another sortable item. isOverlay disables sortable behavior for it.
  isOverlay?: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
};

export function KanbanCard({ card, isOverlay = false, onDelete, onEdit }: KanbanCardProps) {
  // useSortable wires this card into dnd-kit. It gives us:
  // - setNodeRef: attaches dnd-kit tracking to the DOM node
  // - attributes/listeners: accessibility and drag event props for the handle
  // - transform/transition: animated position styles
  // - isDragging: visual state while this card is being dragged
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    // This data travels with the drag event and lets App.findTarget identify
    // whether the active/over item is a card or a column.
    data: { type: "card", cardId: card.id, columnId: card.columnId },
    disabled: isOverlay,
  });

  // dnd-kit returns transform as an object. CSS.Transform.toString converts it
  // into a valid CSS transform like "translate3d(...) scaleX(...)".
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-lg border border-gray-200 border-l-4 bg-white p-3 shadow-sm transition dark:border-gray-700 dark:bg-gray-900",
        priorityStyles[card.priority],
        isDragging && "opacity-35",
        isOverlay && "rotate-1 shadow-lift",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-0.5 inline-flex h-7 w-7 shrink-0 touch-none items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-200 dark:focus:ring-gray-700"
          aria-label={`Drag ${card.title}`}
          title="Drag card"
          // The drag listeners live only on this handle, so users can click
          // edit/delete buttons or select text without accidentally dragging.
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="break-words text-sm font-semibold leading-5 text-gray-950 dark:text-gray-50">{card.title}</h3>
            <span className="rounded-md bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {priorityLabels[card.priority]}
            </span>
          </div>
          {card.description ? (
            <p className="mt-2 break-words text-sm leading-5 text-gray-600 dark:text-gray-300">{card.description}</p>
          ) : null}
        </div>
      </div>

      {/* On small screens the action buttons stay visible because hover is not
         reliable on touch devices. On larger screens they appear on hover/focus. */}
      <div className="mt-3 flex justify-end gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:focus:ring-gray-700"
          aria-label={`Edit ${card.title}`}
          title="Edit card"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:text-gray-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 dark:focus:ring-rose-900"
          aria-label={`Delete ${card.title}`}
          title="Delete card"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
