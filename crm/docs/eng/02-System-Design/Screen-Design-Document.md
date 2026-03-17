# Screen Design Document

## 1. Design System

### 1.1 Design Philosophy

Create a clean, trustworthy, data-forward CRM interface that helps users act quickly and understand pipeline status at a glance.

### 1.2 Color System

- Primary brand colors for trust and clarity
- Semantic colors for success, warning, error, and neutral states

### Pipeline Stage Colors

Use distinct colors by stage so users can visually scan pipeline movement.

### Lead Score Colors

Use consistent A/B/C/D score colors to support prioritization.

### 1.3 Typography

Use readable, hierarchy-driven typography for dashboards, forms, tables, and detail views.

### 1.4 Responsive Breakpoints

Support mobile, tablet, and desktop experiences with layout adjustments rather than feature removal wherever possible.

## 2. Layout Structure

### 2.1 Overall Layout

Sidebar navigation, top-level content area, cards, tables, and panels optimized for operational workflows.

### 2.2 Navigation Menu

Primary areas include dashboard, contacts, deals, tasks, activities, reports, and settings.

## 3. Detailed Screen Design

### 3.1 Login / Sign-Up Screen

Simple, low-friction authentication flow with clear CTA and validation feedback.

### 3.2 Dashboard Screen (`/`)

KPI summary cards, recent activities, recommendation widgets, and pipeline highlights.

### 3.3 Contact List Screen

Searchable and filterable table/list with tags, grades, quick actions, and detail navigation.

### 3.4 Deal Pipeline Screen

Kanban-style stage board with deal cards, stage counts, drag-and-drop or action-based movement, and deal context.

### 3.5 Task List Screen

Task table with due dates, priority, completion state, and notification relevance.

### 3.6 Activity Log Screen

Timeline-centric activity review with filtering by contact, deal, and activity type.

### 3.7 Report Screen

Charts and summaries for performance, activity trends, and pipeline movement.

## 4. Common Components

### 4.1 Buttons

Primary, secondary, destructive, and subtle action patterns with consistent states.

### 4.2 Input Forms

Standard field spacing, validation messages, helper text, and required markers.

### 4.3 Data Display

Cards, tables, badges, charts, and metric blocks designed for fast scanning.

### 4.4 Feedback

Toasts, alerts, empty states, loading states, and confirmation dialogs.

## 5. Interaction Patterns

### 5.1 CRUD Patterns

Predictable create-edit-delete-confirm flows with safe destructive actions and recoverability.

### 5.2 AI Features

Use recommendation cards, score badges, and explanation snippets that remain understandable even when AI confidence is not shown numerically.

## 6. Responsive Support

### Mobile (`< 640px`)

Stacked layouts, condensed navigation, and touch-friendly action surfaces.

### Tablet (`768px`)

Balanced two-column layouts and intermediate-density dashboards.

### Desktop (`1024px+`)

Full sidebar, dense data views, and multi-panel workflows.

## 7. Accessibility

### Keyboard Navigation

Support focus order, accessible labels, visible focus states, and keyboard-operable core workflows.
