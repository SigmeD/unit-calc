# UX-UI Best Practices for Unit Economics Calculator (MVP)

## 1. General Principles
- **Desktop-first + Mobile-friendly**: Main focus on desktop version with proper responsive design for smartphones.  
- **Wizard Flow**: Step-based input (COGS → Fees → Costs → Taxes → Pricing) with guided hints.  
- **Minimalism**: Clean UI, white background, accent buttons, simple typography.  
- **Consistency**: All inputs, buttons, cards must use shared UI primitives (`Button`, `Input`, `Card`).  
- **Feedback**: Instant recalculations; skeleton loaders for export actions.  
- **Accessibility (a11y)**: Semantic HTML, correct aria-* attributes, high contrast, keyboard navigation.  

---

## 2. Interface Structure
### 🔹 Navigation
- Top bar with logo, calculator name, and export button.  
- Progress bar (wizard) with steps: **1. Inputs → 2. Metrics → 3. Break-even → 4. Export**.  

### 🔹 Data Input
- **Cards** for grouped input:  
  - Block 1: COGS  
  - Block 2: Marketplace Fees  
  - Block 3: Additional Costs  
  - Block 4: Taxes  
  - Block 5: Pricing & Discounts  
- Each card contains:  
  - Input + label + tooltip/hint (glossary).  
  - Preset button (“Fill with average values”).  
  - Hints for beginners (ℹ icon).  

### 🔹 Results
- **Dashboard card** with key metrics: CM1, CM2, ROI, ACOS.  
- **Charts**:  
  - Break-even chart (price/volume curve).  
  - Pie chart for cost breakdown.  

### 🔹 Export & Scenarios
- Save up to 3 scenarios → scenario list in sidebar.  
- Export buttons: Excel, Google Sheets.  
- Toast notification on successful export.  

---

## 3. Tailwind Styles (Examples)

### Layout
```tsx
<div className="min-h-screen bg-gray-50 flex flex-col">
  <header className="w-full border-b bg-white px-6 py-4 flex items-center justify-between">
    <h1 className="text-xl font-bold text-gray-900">Unit Economics Calculator</h1>
    <button className="btn-primary">Export</button>
  </header>
  <main className="flex-1 container mx-auto px-4 py-6">
    {/* wizard steps + content */}
  </main>
</div>
Input Card
tsx
Копировать код
<Card className="p-6 rounded-2xl shadow-sm bg-white space-y-4">
  <h2 className="text-lg font-semibold">COGS</h2>
  <Input label="Purchase Price" placeholder="Enter value" />
  <Input label="Logistics" placeholder="Enter value" />
</Card>
Metrics Dashboard
tsx
Копировать код
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <Card className="p-4 text-center">
    <p className="text-sm text-gray-500">Profit Margin</p>
    <p className="text-xl font-bold text-green-600">+18%</p>
  </Card>
  <Card className="p-4 text-center">
    <p className="text-sm text-gray-500">ROI</p>
    <p className="text-xl font-bold text-blue-600">35%</p>
  </Card>
</div>
Button Component
tsx
Копировать код
const Button = ({ children, className, ...props }) => (
  <button
    {...props}
    className={clsx(
      "rounded-xl px-4 py-2 font-semibold transition",
      "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300",
      className
    )}
  >
    {children}
  </button>
);
4. Responsive Guidelines
Desktop:

Sidebar (scenarios) on the left, content on the right.

Metrics in 4-column grid.

Mobile:

Wizard steps as horizontal scroll progress bar.

Cards displayed in single column.

Metrics grid = 2 columns.

Sidebar hidden → separate “Scenarios” tab.

5. Outcome
Step-based UX with clear structure.

Responsive Tailwind layout (desktop-first, mobile-ready).

Unified UI primitives for consistency.

Built-in visualization (charts, dashboards).

Export and scenario management integrated into the workflow.