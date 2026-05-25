import type { BoardState } from "../types";

// All demo cards share this timestamp because the seed board is only used as
// initial example data. New cards and edits receive fresh timestamps in store.
const now = new Date().toISOString();

// This is the default board shown on first load and after pressing reset.
// Once the user changes the board, Zustand persists their version to
// localStorage, so this object will not overwrite their work on refresh.
export const initialBoard: BoardState = {
  columns: [
    {
      id: "backlog",
      title: "Backlog",
      cardIds: ["card-1", "card-2", "card-3"],
    },
    {
      id: "active",
      title: "In Progress",
      cardIds: ["card-4", "card-5"],
    },
    {
      id: "review",
      title: "Review",
      cardIds: ["card-6"],
    },
    {
      id: "done",
      title: "Done",
      cardIds: ["card-7"],
    },
  ],
  cards: {
    "card-1": {
      id: "card-1",
      columnId: "backlog",
      title: "Map keyboard drag states",
      description: "Confirm announcements and focus behavior for sortable cards.",
      priority: "high",
      createdAt: now,
      updatedAt: now,
    },
    "card-2": {
      id: "card-2",
      columnId: "backlog",
      title: "Draft empty-column affordance",
      description: "Make the drop area obvious when a lane has no visible cards.",
      priority: "medium",
      createdAt: now,
      updatedAt: now,
    },
    "card-3": {
      id: "card-3",
      columnId: "backlog",
      title: "Tune compact layout",
      description: "Keep the board comfortable on tablets and narrow screens.",
      priority: "low",
      createdAt: now,
      updatedAt: now,
    },
    "card-4": {
      id: "card-4",
      columnId: "active",
      title: "Build drag overlay",
      description: "Show a lifted card preview while preserving list spacing.",
      priority: "urgent",
      createdAt: now,
      updatedAt: now,
    },
    "card-5": {
      id: "card-5",
      columnId: "active",
      title: "Persist board changes",
      description: "Save local card edits, deletes, and moves between sessions.",
      priority: "high",
      createdAt: now,
      updatedAt: now,
    },
    "card-6": {
      id: "card-6",
      columnId: "review",
      title: "Verify dark mode contrast",
      description: "Review priority colors, borders, inputs, and active states.",
      priority: "medium",
      createdAt: now,
      updatedAt: now,
    },
    "card-7": {
      id: "card-7",
      columnId: "done",
      title: "Choose interaction model",
      description: "Use a visible drag handle while keeping edit controls clickable.",
      priority: "low",
      createdAt: now,
      updatedAt: now,
    },
  },
};
