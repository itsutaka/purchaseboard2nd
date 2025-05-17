# Agent Guidelines for Purchase Order Tracker

## Commands
- Development: `npm run dev`
- Build: `npm run build`
- Start production: `npm run start`
- Lint: `npm run lint`

## Code Style Guidelines
- **TypeScript**: Use strict typing with proper interfaces/types
- **Components**: Functional components with React hooks
- **Imports**: Group imports by external libraries, then internal components/utils
- **Naming**: PascalCase for components, camelCase for variables/functions
- **Error Handling**: Try/catch blocks with appropriate error messages
- **State Management**: Use React hooks (useState, useEffect) and context API
- **Styling**: Chakra UI components with theme-based styling
- **Client Components**: Mark with 'use client' directive at the top
- **Paths**: Use @/ alias for imports from the root directory

## Project Structure
- `/app`: Next.js 14 app directory with route components
- `/components`: Reusable UI components
- `/lib`: Utility functions and service connections
- `/models`: Data models and type definitions