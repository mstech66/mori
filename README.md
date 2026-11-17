# Notes App

A notes application built with **Next.js (App Router)** and styled entirely with **Tailwind CSS**, following modern React and Next.js best practices.

## Features

- **Next.js App Router (`src/app`)**: Server-first architecture with modular client components and providers.
- **100% Tailwind CSS**: Fully converted legacy CSS to utility classes with dark mode and custom theme tokens.
- **Redux Toolkit State Management**: Client-side state persistence for notes and themes with SSR hydration guards.
- **Material UI & Icons**: Seamless integration of MUI components (FAB, Dialog, Transitions) alongside Tailwind styling.
- **Responsive Multi-Column Masonry**: Responsive column layout (`columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-6`) with smooth hover interactions.

## Project Structure

```
├── public/
│   └── assets/
│       ├── fonts/         # Local fonts (SF Pro)
│       └── images/        # Pattern backgrounds (light / dark)
├── src/
│   ├── app/
│   │   ├── globals.css    # Tailwind directives and base layer styles
│   │   ├── layout.tsx     # Root layout with font configuration & providers
│   │   └── page.tsx       # Main page
│   ├── components/
│   │   ├── modal/         # Dialog and note modal components
│   │   ├── nav/           # Navigation bar with dark mode toggle
│   │   ├── note/          # Note card component with Tailwind styling
│   │   └── noteslist/     # Responsive notes masonry grid and FAB
│   ├── lib/
│   │   └── utils.ts       # Tailwind class merging utility (`cn`)
│   ├── providers/
│   │   └── AppProviders.tsx # Client-side Redux & MUI Theme providers
│   └── store/             # Redux slices and LocalStorage persistence
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## Getting Started

### Development Server

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

Create an optimized production build:

```bash
npm run build
npm run start
```

### Linting

Run ESLint to check for code issues:

```bash
npm run lint
```
