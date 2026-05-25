# Drag and Drop Board

A modern Kanban-style drag-and-drop project built with Vite, React, TypeScript, Tailwind CSS, Zustand, dnd-kit, and Lucide icons.

## Features

- Multiple responsive columns
- Drag cards between columns
- Reorder cards within the same column
- Drag handles, overlay preview, and smooth sortable animations
- Add, edit, and delete cards
- Card priorities with color accents
- Search and filter cards
- Keyboard-accessible dragging through dnd-kit sensors
- Dark mode toggle
- Local persistence with `localStorage`
- Production build, linting, and zero known npm vulnerabilities

## Project Structure

```text
.
├── src
│   ├── components
│   │   ├── CardEditor.tsx
│   │   ├── Column.tsx
│   │   └── KanbanCard.tsx
│   ├── data
│   │   └── seed.ts
│   ├── lib
│   │   └── utils.ts
│   ├── store
│   │   └── board.ts
│   ├── App.tsx
│   ├── main.tsx
│   ├── styles.css
│   └── types.ts
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

The development server defaults to `http://localhost:5173/`.
