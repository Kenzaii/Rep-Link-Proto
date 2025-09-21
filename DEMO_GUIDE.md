# Rep-Link Demo Guide

## 🚀 Quick Start

1. **Open the application**: Navigate to `index.html` in your browser
2. **Access Login**: Click "Log in / Sign up" or go directly to `pages/login.html`
3. **Use Mock Login**: Enter credentials or click "Fill" buttons for instant access

## 👤 Mock Login Accounts

### Sales Rep Account
- **Email**: rep@replink.dev
- **Password**: RepLink#2025
- **User**: Demo Rep
- **Role**: Sales Rep
- **Dashboard**: `rep-dashboard.html`

### Business Account
- **Email**: business@replink.dev
- **Password**: RepLink#2025
- **User**: Demo Business
- **Role**: Business
- **Dashboard**: `business-dashboard.html`

## 📊 Dashboard Features to Demo

### Sales Rep Dashboard
- **Performance KPIs**: Total sales, commissions, deals closed, active campaigns
- **Sales by Category**: Interactive donut chart with 45% center text
- **New Opportunities**: 6 business partner cards with sign-up functionality
- **Signed Campaigns**: List with progress bars and status indicators
- **Floating Chat**: Bottom-right chat button (shows "coming soon" toast)

### Business Dashboard
- **Sales Reps Grid**: 4 rep cards with star badges and sales figures
- **Products Panel**: Product list with commission rates and trend indicators
- **Requests Section**: Approval cards with Approve/Decline actions
- **Product Approvals**: Similar approval workflow
- **Floating Chat**: Bottom-right chat button (shows "coming soon" toast)

## 🎯 Interactive Elements

### Sales Rep Dashboard
- Click "Sign Up" on opportunity cards → Shows sign-up process
- Click "Manage" on enrolled opportunities → Navigates to opportunity detail
- Click floating chat button → Shows "coming soon" message

### Business Dashboard
- Click star badges on rep cards → Toggles priority status
- Click "Approve" or "Decline" → Removes card with success message
- Click "Upload" or "Edit" product buttons → Shows "coming soon" message
- Click floating chat button → Shows "coming soon" message

## 🔒 Authentication Flow

1. **Form-Based Login**: Enter email and password in the login form
2. **Quick Fill**: Use "Fill" buttons to auto-populate mock credentials
3. **Persistent Session**: User stays logged in across page refreshes and browser tabs
4. **Global Header**: User name appears in navigation bar on ALL pages when logged in
5. **Logout Everywhere**: Click "Logout" button from any page → Clears auth and redirects to Home
6. **Role-Based Routing**: Dashboard links automatically point to correct role dashboard
7. **Demo Mode**: Dashboards work without strict authentication for demo purposes

### Resilient Authentication Features:
- **Fallback System**: Works with or without `/mock/users.json` file
- **Multiple Path Resolution**: Tries multiple paths to find user data
- **In-Memory Fallback**: Uses hardcoded users if JSON file not accessible
- **Email Normalization**: Trims and lowercases email before comparison
- **Path-Aware Redirects**: Works from any folder depth (pages/, root, etc.)
- **Quick Fill**: One-click credential population for demo purposes
- **Centralized Auth**: All auth state managed in centralized store
- **Event-Driven Updates**: Header updates automatically when auth state changes

## 🎨 Design System

### Brand Colors
- **Blue (#05AADC)**: Primary actions, donut chart, star badges
- **Green (#19AF6E)**: Success states, progress bars, positive trends
- **Dark Navy (#0A1E32)**: Text, headings, professional elements

### Responsive Design
- **Desktop**: Full grid layouts with all features
- **Tablet**: Simplified grids, stacked layouts
- **Mobile**: Single column, touch-friendly buttons

## 📱 Mobile Testing

- Resize browser window to test responsive layouts
- Touch interactions work on mobile devices
- All buttons and interactive elements are touch-friendly

## 🔧 Technical Features

### Performance
- Canvas-based donut chart with smooth animations
- Lazy loading for avatar images
- Optimistic UI updates for approvals
- No external dependencies

### Accessibility
- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus management with brand color focus rings

## 🎪 Demo Script for VC

1. **Start with Homepage**: Show professional design and value proposition
2. **Login Flow**: Demonstrate quick mock login for both roles
3. **Sales Rep Dashboard**: 
   - Highlight performance metrics
   - Show interactive donut chart
   - Demonstrate opportunity sign-up flow
4. **Business Dashboard**:
   - Show rep management with star system
   - Demonstrate approval workflows
   - Highlight product management features
5. **Responsive Demo**: Resize browser to show mobile adaptation
6. **Logout Flow**: Show clean logout and return to login

## 🚨 Prototype Notes

- All data is mock/static for demonstration
- No real authentication or payments
- Chat features show "coming soon" messages
- File uploads show placeholder messages
- All interactions are simulated for demo purposes

## 📁 File Structure

```
rep-link/
├── pages/
│   ├── login.html (with mock login buttons)
│   ├── rep-dashboard.html
│   ├── business-dashboard.html
│   └── ...
├── scripts/
│   ├── features/
│   │   ├── dashboardRep.js
│   │   └── dashboardBusiness.js
│   └── ui/
│       └── donutChart.js
├── styles/
│   └── dashboard.css
├── mock/
│   ├── dashboard_rep.json
│   └── dashboard_business.json
└── assets/img/ (avatar placeholders)
```

## 🎯 Key Selling Points

1. **Professional Design**: Clean, modern interface with brand consistency
2. **Centralized Authentication**: Single source of truth for auth state with event-driven updates
3. **Interactive Dashboards**: Rich data visualization and user interactions
4. **Responsive Design**: Works seamlessly across all devices
5. **Scalable Architecture**: Clean code structure ready for full-stack migration
6. **User Experience**: Intuitive workflows with immediate feedback
7. **Performance**: Fast loading with smooth animations
8. **Accessibility**: WCAG compliant with keyboard navigation

## ✅ Acceptance Criteria

- ✅ Resilient login API with fallback users (works without /mock/users.json)
- ✅ Mock credentials work: rep@replink.dev / RepLink#2025 and business@replink.dev / RepLink#2025
- ✅ Quick-fill buttons auto-populate credentials
- ✅ Login redirects to correct dashboard based on user role from any folder depth
- ✅ Clicking Logout from any page clears localStorage auth, re-renders header, and redirects to Home
- ✅ After logging in and clicking Home, the header still shows Dashboard + Logout, not "Login"
- ✅ Opening a new tab retains logged-in header (auth persisted)
- ✅ Dashboard link points to the correct role with proper path resolution
- ✅ No console errors (fallback warning is expected if JSON not accessible)
- ✅ Global logout works on router-loaded pages
- ✅ Header updates automatically when auth state changes
- ✅ Single source of truth for authentication state
- ✅ Path-aware redirects work from any folder depth

Ready for your VC presentation! 🚀
