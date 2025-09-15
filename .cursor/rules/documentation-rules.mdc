# Documentation-Rules: Unit Economics Calculator

This document outlines the technical standards and best practices for the development of the "Unit Economics Calculator" project. [cite_start]The goal is to create a codebase that is reliable, performant, and easy to maintain[cite: 1303].

## 1. Project Architecture & Structure

[cite_start]The project structure must be organized by feature to ensure scalability and maintainability[cite: 1133].

* [cite_start]**Feature-Based Modules**: All code related to a specific feature (e.g., calculator form, results visualization, data export) should be co-located within its own directory[cite: 1133, 1259, 1325, 1333, 1338].
    * Example MVP Structure:
        ```
        src/
        ├── features/
        │   ├── calculator/      # Main data input and calculation logic
        │   ├── scenarios/      # Logic for saving/loading up to 3 scenarios
        │   └── export/        # Excel export functionality
        ├── shared/
        [cite_start]│   ├── ui/            # Reusable UI components (Button, Input, Card) [cite: 1137]
        [cite_start]│   ├── hooks/         # Common hooks (useToggle, etc.) [cite: 1137, 1260]
        │   └── lib/           # API clients, utility functions
        ```
* [cite_start]**Public API Exposure**: Each feature module must expose its public components and hooks through a `index.ts` barrel file[cite: 1134, 1259]. [cite_start]Direct imports from nested files of other features are forbidden to prevent tight coupling[cite: 1261].
* [cite_start]**Consistent Exports**: Use named exports consistently across the project[cite: 1135].

## 2. Component Design

Components are the fundamental building blocks. [cite_start]They must be kept simple and focused[cite: 932].

* [cite_start]**Single Responsibility Principle**: A component should do one thing only[cite: 933]. [cite_start]Logic (data fetching, state management) must be separated from presentation (UI rendering)[cite: 933].
    * [cite_start]**Data/Logic**: Encapsulate complex logic and state management in custom hooks (e.g., `useCalculatorState`)[cite: 961].
    * [cite_start]**Presentation**: UI components should be "dumb," receiving data and callbacks via props[cite: 975]. [cite_start]The `UserProfile` component is a good example of this principle[cite: 995, 996].
* [cite_start]**Readability in JSX**: JSX must be kept declarative and easy to scan[cite: 1040].
    * [cite_start]For complex conditional rendering, use early returns or variables instead of deeply nested ternaries[cite: 1041, 1043].
    * [cite_start]Use the `&&` operator for simple conditional rendering[cite: 1042].
* [cite_start]**Keys in Lists**: Never use the array index as a `key` for lists[cite: 1044, 1128, 1247]. [cite_start]Keys must be stable and unique identifiers[cite: 1127, 1246].

## 3. State Management

[cite_start]Given the calculator's need for instant recalculations[cite: 1333], a structured approach to state is crucial.

* [cite_start]**Choose the Right Tool**: Start simple and escalate tooling only when necessary[cite: 998].
    * [cite_start]**`useState`**: For simple, local component state (e.g., modal visibility, input values)[cite: 999].
    * [cite_start]**`useReducer`**: For the main calculator form, as its state updates are complex and interdependent[cite: 1000].
    * [cite_start]**Context API**: To provide shared data like the current marketplace (WB/Ozon) or theme information deep down the component tree[cite: 1001].
    * [cite_start]**Zustand**: For managing a small amount of global state, such as the user's saved scenarios [cite: 1372][cite_start], as it is a lightweight option[cite: 1003].
* [cite_start]**No Derived State**: Do not store state that can be computed from other state or props[cite: 1004].

## 4. Styling (Tailwind CSS)

[cite_start]The project will use React + Tailwind CSS[cite: 1346].

* [cite_start]**Component-Based Styles**: Encapsulate common sets of Tailwind classes into reusable UI components (e.g., `Button`, `Input`) to avoid "classname hell"[cite: 1067, 1068].
* [cite_start]**Conditional Classes**: Use a utility like `clsx` to cleanly manage conditional class application[cite: 1067].

## 5. Type Safety (TypeScript)

The entire codebase must be type-safe.

* [cite_start]**Strict Typing**: Always provide explicit types for component props, hook return values, and event handlers[cite: 1104, 1205]. [cite_start]The use of `any` is strictly forbidden unless absolutely necessary[cite: 1106, 1206].
* [cite_start]**Discriminated Unions**: For handling asynchronous operations or states with multiple variants (e.g., `'idle' | 'loading' | 'success' | 'error'`), use discriminated unions to ensure type safety[cite: 1105, 1207].

## 6. Performance and Optimization

[cite_start]Performance is a key non-functional requirement[cite: 1347].

* [cite_start]**Intentional Memoization**: Do not wrap every component in `React.memo` or every function in `useCallback` by default[cite: 1007]. [cite_start]Apply these optimizations only to solve identified performance bottlenecks[cite: 1008, 1237].
* [cite_start]**Heavy Computations**: Use `useMemo` for expensive calculations that should not be re-run on every render[cite: 1122, 1238].
* [cite_start]**Large Lists**: If any lists become large in future versions, they must be virtualized using a library like `react-window`[cite: 1124].

## 7. Data Fetching

[cite_start]While the MVP is client-side, future versions will involve API calls[cite: 1383].

* [cite_start]**Use a Data-Fetching Library**: For all server state, use a library like TanStack Query or SWR to handle caching, retries, and invalidation automatically[cite: 1099, 1183].
* [cite_start]**Centralized API Client**: All API calls should go through a single, thin client wrapper that centralizes error handling, headers, and authentication logic[cite: 1100, 1184].

## 8. Testing

[cite_start]The application must be thoroughly tested to ensure accuracy, especially for calculation formulas[cite: 1348].

* [cite_start]**Behavior-Driven Tests**: Use React Testing Library to write tests that simulate user behavior rather than testing implementation details[cite: 1140, 1275].
* [cite_start]**Unit Tests**: Critical business logic, especially the unit economics formulas and custom hooks, must have comprehensive unit test coverage[cite: 1142, 1276, 1348].
* [cite_start]**Visual Regression**: Use Storybook to document and visually test UI components in different states[cite: 1143, 1276].

## 9. Accessibility (a11y)

The application must be accessible to all users.

* [cite_start]**Semantic HTML**: Use semantic HTML elements correctly[cite: 1109, 1218].
* [cite_start]**Keyboard Navigation**: Ensure all interactive elements are reachable and operable via the keyboard, with clear `:focus-visible` styling[cite: 1111, 1220].
* [cite_start]**ARIA Attributes**: Use `aria-*` attributes where necessary to provide additional context, such as `aria-invalid` for form validation[cite: 1109, 1224].
* [cite_start]**Image Accessibility**: All `<img>` tags must have a descriptive `alt` attribute[cite: 1110, 1219].