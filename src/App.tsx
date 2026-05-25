import { useEffect, useMemo, useState } from "react";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Moon, RotateCcw, Search, Sun } from "lucide-react";
import { useBoardStore } from "./store/board";
import type { Card } from "./types";
import { Column } from "./components/Column";
import { KanbanCard } from "./components/KanbanCard";
import { cn } from "./lib/utils";

// Helper used during drag operations. Cards are stored in a dictionary, so this
// gives us the current column for any card id in constant time.
function getColumnIdForCard(cards: Record<string, Card>, cardId: string) {
  return cards[cardId]?.columnId ?? null;
}

export function App() {
  // Search text is local UI state because it does not need to persist.
  const [query, setQuery] = useState("");

  // Theme preference is stored outside Zustand because it is app chrome, not
  // board data. The lazy initializer reads localStorage only on first render.
  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark");

  // activeCardId powers the DragOverlay. dnd-kit moves the real item with CSS,
  // while the overlay gives the user a clean lifted preview.
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  // Select only the pieces of store state this component needs. Smaller
  // selectors help avoid unnecessary rerenders as the app grows.
  const columns = useBoardStore((state) => state.columns);
  const cards = useBoardStore((state) => state.cards);
  const moveCard = useBoardStore((state) => state.moveCard);
  const resetBoard = useBoardStore((state) => state.resetBoard);

  // Sensors tell dnd-kit how dragging can begin:
  // - PointerSensor supports mouse/touch dragging
  // - KeyboardSensor supports accessible keyboard sorting
  // The small distance prevents accidental drags when clicking edit/delete.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Tailwind's dark mode is configured to use the "dark" class, so toggling
  // that class on <html> switches every dark: utility in the UI.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const normalizedQuery = query.trim().toLowerCase();

  // Filtering produces a Set of matching ids. Columns still render in their
  // original order, but each column receives only the cards that match.
  const visibleCardIds = useMemo(() => {
    if (!normalizedQuery) return null;

    return new Set(
      Object.values(cards)
        .filter((card) => `${card.title} ${card.description} ${card.priority}`.toLowerCase().includes(normalizedQuery))
        .map((card) => card.id),
    );
  }, [cards, normalizedQuery]);

  const activeCard = activeCardId ? cards[activeCardId] : null;

  // Converts dnd-kit's drop event into the exact destination our store needs:
  // a target column id and an index inside that column.
  function findTarget(event: DragEndEvent) {
    const activeId = String(event.active.id);
    const over = event.over;
    if (!over) return null;

    const overId = String(over.id);
    const overType = over.data.current?.type;
    const sourceColumnId = getColumnIdForCard(cards, activeId);
    if (!sourceColumnId) return null;

    // If the card is dropped on the empty body of a column, append it to the
    // end of that column. The column droppable supplies type: "column".
    if (overType === "column") {
      const targetColumnId = over.data.current?.columnId as string;
      const targetColumn = columns.find((column) => column.id === targetColumnId);
      if (!targetColumn) return null;

      return {
        columnId: targetColumnId,
        index: targetColumn.cardIds.filter((id) => id !== activeId).length,
      };
    }

    // Otherwise, the card was dropped over another card. We use that card's
    // current column and index to decide where the dragged card should land.
    const targetColumnId = getColumnIdForCard(cards, overId);
    const targetColumn = columns.find((column) => column.id === targetColumnId);
    if (!targetColumn || !targetColumnId) return null;

    // Remove the active card before calculating the target index. This prevents
    // off-by-one errors when reordering inside the same column.
    const nextIndex = targetColumn.cardIds.filter((id) => id !== activeId).indexOf(overId);
    return {
      columnId: targetColumnId,
      index: nextIndex < 0 ? targetColumn.cardIds.length : nextIndex,
    };
  }

  function handleDragStart(event: DragStartEvent) {
    // Save the dragged card id so DragOverlay can render a floating copy.
    setActiveCardId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id);
    const target = findTarget(event);
    // Always clear the overlay when dragging finishes, even if no valid target
    // was found.
    setActiveCardId(null);

    if (!target) return;
    // All actual board mutation is centralized in the Zustand store.
    moveCard(activeId, target.columnId, target.index);
  }

  return (
    <main className="min-h-screen bg-gray-100 text-gray-950 transition-colors dark:bg-gray-950 dark:text-gray-50">
      <div className="mx-auto flex min-h-screen w-full max-w-[96rem] flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-gray-200 pb-5 dark:border-gray-800 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Production kanban workspace</p>
            <h1 className="mt-1 text-3xl font-bold tracking-normal text-gray-950 dark:text-white">Drag and Drop Board</h1>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative block min-w-0 sm:w-80">
              <span className="sr-only">Search cards</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search cards"
                className="h-10 w-full rounded-md border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-gray-500 dark:focus:ring-gray-800"
              />
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsDark((value) => !value)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus:ring-gray-700"
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                title={isDark ? "Light mode" : "Dark mode"}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={resetBoard}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus:ring-gray-700"
                aria-label="Reset board"
                title="Reset board"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <DndContext
          sensors={sensors}
          // closestCorners works well for Kanban boards because columns and
          // cards are rectangular targets arranged in rows/lists.
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveCardId(null)}
        >
          <div className="mt-5 flex flex-1 gap-4 overflow-x-auto pb-4">
            {columns.map((column) => {
              // Convert each column's ordered cardIds into full Card objects.
              // Missing ids are filtered out defensively in case persisted data
              // is ever manually edited or becomes stale.
              const columnCards = column.cardIds
                .map((id) => cards[id])
                .filter((card): card is Card => Boolean(card))
                .filter((card) => !visibleCardIds || visibleCardIds.has(card.id));

              return <Column key={column.id} column={column} cards={columnCards} />;
            })}
          </div>

          {/* DragOverlay renders outside the normal list layout, which keeps the
             dragged preview smooth while the original list animates around it. */}
          <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }}>
            {activeCard ? <KanbanCard card={activeCard} isOverlay /> : null}
          </DragOverlay>
        </DndContext>

        <footer
          className={cn(
            "border-t border-gray-200 py-3 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400",
            query && "text-gray-600 dark:text-gray-300",
          )}
        >
          {query ? "Showing matching cards. Clear search to restore every lane." : "Changes are saved locally in this browser."}
        </footer>
      </div>
    </main>
  );
}
