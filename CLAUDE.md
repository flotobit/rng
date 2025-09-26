# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based RNG (Random Number Generator) roll game featuring:
- Item rarity system with 8 tiers (Common to Divine)
- Inventory management and selling mechanics
- Shop system with boosts and power-ups
- Coin-based economy
- Roll cooldown system

## Project Structure

```
rng/
├── public/
│   └── index.html     # HTML template with Tailwind CSS
├── src/
│   ├── App.js         # Main game component with all game logic
│   └── index.js       # React app entry point
├── package.json       # Dependencies and scripts
└── package-lock.json  # Dependency lock file
```

## Common Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Key Architecture Decisions

### State Management
The game uses React hooks (`useState`, `useEffect`) for state management. All game logic is contained within the `RNGGame` component in App.js:
- `coins`: Player currency
- `inventory`: Object storing item counts by rarity
- `boosts`: Active power-ups (luck, coin multiplier)
- `rollCooldown`: Prevents spam rolling

### Styling
The application uses Tailwind CSS via CDN (loaded in index.html). All styling is done with utility classes directly in the components.

### Rarity System
Items are defined in the `rarities` object with:
- Drop chance percentages
- Value ranges for coin rewards
- Visual styling (colors, icons, effects)

## Development Notes

- The project follows standard Create React App structure with package.json at root
- Dependencies are installed and the app runs successfully
- Minor webpack deprecation warnings exist but don't affect functionality
- All game logic is self-contained in App.js for simplicity
- The app uses React 18 with hooks for state management
- Tailwind CSS is loaded via CDN in index.html