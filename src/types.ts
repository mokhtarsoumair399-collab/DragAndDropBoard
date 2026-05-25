// Priority is a small union type instead of a plain string so TypeScript can
// catch invalid values like "critical" or "normal" at compile time.
export type Priority = "low" | "medium" | "high" | "urgent";

// A card stores both its own content and the id of the column it belongs to.
// The columnId duplicate makes lookups simple during drag-and-drop operations.
export type Card = {
  id: string;
  columnId: string;
  title: string;
  description: string;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
};

// Columns keep an ordered list of card ids. The full card data lives in the
// cards dictionary below, which avoids duplicating card objects in arrays.
export type Column = {
  id: string;
  title: string;
  cardIds: string[];
};

// BoardState is normalized:
// - columns controls lane order and card order within each lane
// - cards gives fast access to any card by id
export type BoardState = {
  columns: Column[];
  cards: Record<string, Card>;
};

// CardDraft represents form data before it becomes a saved Card. It excludes
// generated fields such as id, createdAt, updatedAt, and columnId.
export type CardDraft = {
  title: string;
  description: string;
  priority: Priority;
};
