import { nanoid } from "nanoid";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { initialBoard } from "../data/seed";
import type { BoardState, Card, CardDraft } from "../types";

// BoardStore combines the raw board data with the actions that can mutate it.
// Components only call these actions; they never directly edit arrays/objects.
type BoardStore = BoardState & {
  addCard: (columnId: string, draft: CardDraft) => void;
  updateCard: (cardId: string, draft: CardDraft) => void;
  deleteCard: (cardId: string) => void;
  moveCard: (cardId: string, targetColumnId: string, targetIndex: number) => void;
  resetBoard: () => void;
};

// Drag targets can resolve to an index beyond the current list length,
// especially when dropping into an empty area. Clamping keeps splice safe.
function clampIndex(index: number, length: number) {
  return Math.max(0, Math.min(index, length));
}

// Zustand creates a tiny global store. The persist middleware automatically
// serializes the selected state to localStorage and restores it on page load.
export const useBoardStore = create<BoardStore>()(
  persist(
    (set) => ({
      ...initialBoard,
      addCard: (columnId, draft) =>
        set((state) => {
          // nanoid creates collision-resistant ids for user-generated cards.
          const id = nanoid();
          const createdAt = new Date().toISOString();
          const card: Card = {
            id,
            columnId,
            title: draft.title.trim(),
            description: draft.description.trim(),
            priority: draft.priority,
            createdAt,
            updatedAt: createdAt,
          };

          return {
            // Store the card by id for quick lookup.
            cards: { ...state.cards, [id]: card },
            // Add new cards to the top of the selected column.
            columns: state.columns.map((column) =>
              column.id === columnId ? { ...column, cardIds: [id, ...column.cardIds] } : column,
            ),
          };
        }),
      updateCard: (cardId, draft) =>
        set((state) => ({
          cards: {
            ...state.cards,
            // Preserve generated metadata and replace only editable fields.
            [cardId]: {
              ...state.cards[cardId],
              title: draft.title.trim(),
              description: draft.description.trim(),
              priority: draft.priority,
              updatedAt: new Date().toISOString(),
            },
          },
        })),
      deleteCard: (cardId) =>
        set((state) => {
          // Remove the card object from the dictionary.
          const { [cardId]: deleted, ...cards } = state.cards;
          // This marks the destructured value as intentionally unused.
          void deleted;

          return {
            cards,
            // Also remove the card id from every column, so no column points
            // at a deleted card.
            columns: state.columns.map((column) => ({
              ...column,
              cardIds: column.cardIds.filter((id) => id !== cardId),
            })),
          };
        }),
      moveCard: (cardId, targetColumnId, targetIndex) =>
        set((state) => {
          const card = state.cards[cardId];
          if (!card) return state;

          // We derive the source column from cardIds instead of trusting stale
          // drag data. That keeps the move safe even after rapid state changes.
          const sourceColumn = state.columns.find((column) => column.cardIds.includes(cardId));
          const targetColumn = state.columns.find((column) => column.id === targetColumnId);
          if (!sourceColumn || !targetColumn) return state;

          // First remove the card from its original list. This is important for
          // same-column reordering because otherwise the card would appear twice.
          const withoutCard = sourceColumn.cardIds.filter((id) => id !== cardId);

          // If source and target are the same column, insert into the source
          // list after removal. If moving across columns, insert into the target
          // list, also defensively removing the id if it already exists there.
          const insertionBase =
            sourceColumn.id === targetColumn.id ? withoutCard : targetColumn.cardIds.filter((id) => id !== cardId);
          const nextTargetIds = [...insertionBase];
          // splice performs the actual insertion at the computed drop index.
          nextTargetIds.splice(clampIndex(targetIndex, nextTargetIds.length), 0, cardId);

          return {
            cards: {
              ...state.cards,
              [cardId]: {
                ...card,
                columnId: targetColumnId,
                updatedAt: new Date().toISOString(),
              },
            },
            columns: state.columns.map((column) => {
              // Cross-column moves must update both the old and new columns.
              if (column.id === sourceColumn.id && column.id !== targetColumnId) {
                return { ...column, cardIds: withoutCard };
              }
              // Same-column moves only hit this branch and replace that column's
              // card ordering with the reordered ids.
              if (column.id === targetColumnId) {
                return { ...column, cardIds: nextTargetIds };
              }
              return column;
            }),
          };
        }),
      resetBoard: () => set(initialBoard),
    }),
    {
      // localStorage key used by Zustand persist.
      name: "drag-and-drop-board",
      // Persist only data, not action functions.
      partialize: ({ columns, cards }) => ({ columns, cards }),
    },
  ),
);
