# Rep-Link - Freelance Sales Marketplace

A production-quality prototype of Rep-Link, a marketplace connecting Freelance Sales Reps and Business Clients in Singapore. Built with vanilla HTML/CSS/JS with clean modular structure for easy future migration to a secure full-stack.

## 🚀 Quick Start

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (for CORS compliance with ES modules)

### Installation

1. **Clone or download the repository**
   ```bash
   git clone <repository-url>
   cd rep-link
   ```

2. **Start a local web server**
   
   **Option 1: Using Python (if installed)**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```
   
   **Option 2: Using Node.js (if installed)**
   ```bash
   npx serve .
   ```
   
   **Option 3: Using PHP (if installed)**
   ```bash
   php -S localhost:8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

## 📁 Project Structure

```
rep-link/
├── index.html                 # Home page
├── pages/                     # All application pages
│   ├── how-it-works.html
│   ├── opportunities.html
│   ├── opportunity-detail.html
│   ├── post-opportunity.html
│   ├── login.html
│   ├── signup.html
│   ├── rep-dashboard.html
│   ├── business-dashboard.html
│   ├── messages.html
│   ├── contracts.html
│   ├── faq.html
│   ├── help.html
│   ├── privacy.html
│   └── terms.html
├── assets/                    # Static assets
│   ├── img/                  # Images and logos
│   ├── icons/                # SVG icons
│   └── fonts/                # Custom fonts
├── styles/                    # CSS files
│   ├── base.css              # Reset, variables, typography
│   ├── layout.css            # Grid, containers, header/footer
│   ├── components.css        # Cards, badges, buttons, modals
│   ├── utilities.css         # Helper classes
│   └── animations.css        # Micro-interactions
├── scripts/                   # JavaScript modules
│   ├── app.js                # Main application bootstrap
│   ├── ui/                   # UI utilities and components
│   │   ├── dom.js            # DOM helpers
│   │   ├── components.js     # Reusable components
│   │   ├── forms.js          # Form validation
│   │   ├── animations.js     # Animation utilities
│   │   ├── event-bus.js      # Event system
│   │   └── router.js         # Client-side routing
│   ├── data/                 # Data layer
│   │   ├── api.js            # Mock API layer
│   │   └── store.js          # Local storage store
│   └── features/             # Feature modules
│       ├── auth.js           # Authentication
│       ├── opportunities.js  # Opportunity management
│       ├── proposals.js      # Proposal system
│       ├── messaging.js      # Messaging system
│       ├── contracts.js      # Contract management
│       ├── dashboard.js      # Dashboard widgets
│       ├── searchFilters.js  # Search and filtering
│       └── faq.js            # FAQ management
└── mock/                     # Mock data
    ├── users.json
    ├── businesses.json
    ├── opportunities.json
    ├── proposals.json
    ├── messages.json
    ├── contracts.json
    └── faq.json
```

## 🎯 Features

### Core Marketplace Functionality
- **Opportunity Browsing**: Search, filter, and browse sales opportunities
- **Proposal System**: Submit and manage proposals with cover letters and attachments
- **Contract Management**: Milestone-based contracts with escrow simulation
- **Messaging System**: Real-time messaging between reps and businesses
- **Dashboard Analytics**: Comprehensive dashboards for both user types
- **Reputation System**: Rep-Link Success Score (RSS) similar to Upwork's JSS

### User Roles
- **Sales Reps**: Browse opportunities, submit proposals, manage contracts
- **Businesses**: Post opportunities, review proposals, manage contracts

### Commission Models
- **Fixed Price**: One-time payment upon completion
- **Milestone-based**: Payments tied to specific deliverables

### Security & Compliance
- **Mock Singpass Integration**: Simulated identity verification
- **Escrow Simulation**: 14-day auto-release system
- **Dispute Resolution**: Non-binding mediation process
- **Data Protection**: PDPA-compliant data handling (simulated)

## 🎨 Design System

### Brand Identity
- **Name**: Rep-Link
- **Style**: Modern, trustworthy, business-first
- **Colors**: Deep blue (#0b1220), brand blue (#1e90ff), success green (#22c55e)

### Typography
- **Font Stack**: System fonts (SF Pro, Segoe UI, Inter)
- **Scale**: Large, legible sizes with tight line-height on headings

### Components
- **Buttons**: Primary, secondary, tertiary variants
- **Cards**: Opportunity cards, message previews, dashboard widgets
- **Forms**: Accessible forms with inline validation
- **Modals**: Focus-trapped modals with keyboard navigation
- **Animations**: Subtle micro-interactions (150-220ms)

## 🔧 Technical Architecture

### Frontend Stack
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Custom properties, Grid, Flexbox, modern selectors
- **Vanilla JavaScript**: ES6+ modules, no frameworks
- **Progressive Enhancement**: Works without JavaScript

### Module System
- **ES Modules**: Clean import/export structure
- **Feature-based**: Organized by business functionality
- **Dependency Injection**: Loose coupling between modules

### Data Layer
- **Mock API**: Simulates backend with localStorage persistence
- **Store Pattern**: Centralized state management
- **Event Bus**: Decoupled component communication

## 🚦 Simulated Features

### Authentication
- **Mock Login/Register**: No real authentication
- **Singpass Integration**: Simulated identity verification
- **Session Management**: Local storage-based sessions

### Payments & Escrow
- **Escrow Simulation**: 14-day auto-release system
- **Milestone Tracking**: Visual progress indicators
- **Dispute Resolution**: Information-only process

### Real-time Features
- **Messaging**: Simulated real-time chat
- **Notifications**: Toast notifications
- **Live Updates**: Simulated data synchronization

## 🎭 Prototype Limitations

### Security Notice
This is a **prototype only**. The following features are simulated:
- No real authentication or user verification
- No actual payments or escrow services
- No real Singpass integration
- No actual data persistence beyond localStorage

### Production Readiness
To make this production-ready, you would need:
- Secure backend API (Node.js, Python, etc.)
- Real authentication system (OAuth, JWT)
- Payment processing (Stripe, PayPal)
- Database (PostgreSQL, MongoDB)
- Real-time messaging (WebSockets, Socket.io)
- File storage (AWS S3, Cloudinary)
- Email service (SendGrid, Mailgun)

## 🛣️ Migration Roadmap

### Phase 1: Backend API
- Replace `api.js` with real HTTP client
- Implement RESTful endpoints
- Add proper error handling and retry logic

### Phase 2: Authentication
- Integrate with real auth provider
- Implement JWT token management
- Add role-based access control

### Phase 3: Database
- Replace localStorage with real database
- Implement data models and migrations
- Add data validation and sanitization

### Phase 4: Real-time Features
- Implement WebSocket connections
- Add real-time messaging
- Implement live notifications

### Phase 5: Payment Integration
- Integrate payment processor
- Implement escrow system
- Add financial reporting

## 🧪 Testing

### Manual Testing Checklist
- [ ] All pages load without console errors
- [ ] Navigation works with back/forward buttons
- [ ] Search and filters function correctly
- [ ] Form validation works properly
- [ ] Modals open/close with keyboard navigation
- [ ] Responsive design works on mobile
- [ ] Accessibility features function (screen reader, keyboard)

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Features
- Touch-friendly interface
- Swipe gestures for navigation
- Optimized form inputs
- Collapsible navigation

## ♿ Accessibility

### WCAG AA Compliance
- Semantic HTML structure
- Proper heading hierarchy
- Alt text for images
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- Color contrast compliance

### Keyboard Shortcuts
- `Ctrl/Cmd + K`: Focus search
- `Escape`: Close modals
- `Tab`: Navigate between elements
- `Enter/Space`: Activate buttons

## 🎨 Animation Guidelines

### Performance
- All animations under 220ms
- Use `transform` and `opacity` for smooth performance
- Respect `prefers-reduced-motion` setting
- No animations on low-end devices

### Timing Functions
- **Easing**: `cubic-bezier(0.2, 0.7, 0.2, 1)`
- **Duration**: 120ms (fast), 150ms (normal), 220ms (slow)

## 📊 Performance

### Optimization
- Lazy loading for images
- Debounced search (300ms)
- Throttled scroll events
- Minimal JavaScript bundle (~80KB)

### Metrics
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- First Input Delay: < 100ms

## 🤝 Contributing

### Code Standards
- Use strict ES6+ modules
- Follow BEM-like CSS naming
- Write semantic HTML
- Include JSDoc comments
- No inline styles or scripts

### Git Workflow
1. Create feature branch
2. Make changes with descriptive commits
3. Test thoroughly
4. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For questions or support:
- Email: hello@rep-link.sg
- Phone: +65 9123 4567
- FAQ: [faq.html](pages/faq.html)

---

**Note**: This is a prototype for demonstration purposes. No real transactions or data processing occurs.
