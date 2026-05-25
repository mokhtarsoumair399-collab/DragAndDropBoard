import { useMemo, useState } from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { useBoardStore } from "../store/board";
import type { Card, CardDraft, Column as ColumnType } from "../types";
import { cn, formatCount } from "../lib/utils";
import { CardEditor } from "./CardEditor";
import { KanbanCard } from "./KanbanCard";

type ColumnProps = {
  column: ColumnType;
  cards: Card[];
};

// A Column is both:
// - a droppable area, so cards can be dropped into empty column space
// - a SortableContext, so cards inside it can be reordered with animation
export function Column({ column, cards }: ColumnProps) {
  // Local UI state controls whether inline add/edit forms are visible.
  const [isAdding, setIsAdding] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  // Store actions mutate the board and are persisted automatically.
  const addCard = useBoardStore((state) => state.addCard);
  const updateCard = useBoardStore((state) => state.updateCard);
  const deleteCard = useBoardStore((state) => state.deleteCard);

  // Register the entire column as a droppable target. The data object is later
  // read in App.findTarget to distinguish column drops from card drops.
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", columnId: column.id },
  });

  // SortableContext only needs ids, not full card objects. Memoizing prevents a
  // new array from being created unless the visible cards actually change.
  const cardIds = useMemo(() => cards.map((card) => card.id), [cards]);

  function handleAddCard(draft: CardDraft) {
    addCard(column.id, draft);
    setIsAdding(false);
  }

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex max-h-[calc(100vh-15rem)] min-h-[24rem] w-full min-w-[18rem] flex-col rounded-lg border bg-gray-50/80 transition dark:bg-gray-950/70 sm:w-[21rem]",
        isOver
          ? "border-gray-400 ring-2 ring-gray-300 dark:border-gray-500 dark:ring-gray-700"
          : "border-gray-200 dark:border-gray-800",
      )}
    >
      <header className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-gray-950 dark:text-gray-50">{column.title}</h2>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{formatCount(cards.length, "card")}</p>
        </div>
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus:ring-gray-700"
          aria-label={`Add card to ${column.title}`}
          title="Add card"
        >
          <Plus className="h-4 w-4" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-3">
        {/* SortableContext tells dnd-kit which cards belong to this list and
           which sorting strategy to use when calculating animated movement. */}
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {isAdding ? <CardEditor mode="add" onCancel={() => setIsAdding(false)} onSubmit={handleAddCard} /> : null}

            {cards.map((card) =>
              // Only one card can be edited at a time in this column. When a
              // card is being edited, we replace the card UI with the editor.
              editingCardId === card.id ? (
                <CardEditor
                  key={card.id}
                  mode="edit"
                  initialValue={{
                    title: card.title,
                    description: card.description,
                    priority: card.priority,
                  }}
                  onCancel={() => setEditingCardId(null)}
                  onSubmit={(draft) => {
                    updateCard(card.id, draft);
                    setEditingCardId(null);
                  }}
                />
              ) : (
                // Normal card rendering includes drag, edit, and delete controls.
                <KanbanCard
                  key={card.id}
                  card={card}
                  onEdit={() => setEditingCardId(card.id)}
                  onDelete={() => deleteCard(card.id)}
                />
              ),
            )}

            {/* Empty columns still need a visible drop target. The parent
               section is the actual droppable; this is the user-facing hint. */}
            {cards.length === 0 && !isAdding ? (
              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white/70 px-4 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-400">
                Drop cards here
              </div>
            ) : null}
          </div>
        </SortableContext>
      </div>
    </section>
  );
}
