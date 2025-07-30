# Hydroponic Monitoring System

## Overview

This is a full-stack hydroponic monitoring system built with React + TypeScript on the frontend and Express.js + Node.js on the backend. The application monitors environmental conditions in hydroponic systems including temperature, humidity, pH levels, and water levels. It features real-time data visualization, alert management, and integration with the Antares IoT platform for sensor data collection.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Styling**: Tailwind CSS with shadcn/ui component library
- **UI Components**: Extensive use of Radix UI primitives for accessibility

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database**: PostgreSQL with Drizzle ORM (configured but using in-memory storage currently)
- **Session Management**: Express sessions with PostgreSQL store
- **Build System**: ESBuild for server bundling

### Data Storage Solutions
- **Primary Database**: PostgreSQL (via Neon serverless)
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Current Implementation**: In-memory storage for development/demo purposes
- **Migration Strategy**: Drizzle Kit for database migrations

## Key Components

### Sensor Data Management
- Real-time sensor reading collection (temperature, humidity, pH, water level)
- Time-based data queries with filtering capabilities
- Data export functionality (JSON/CSV formats)
- Alert threshold management

### Dashboard Features
- Multi-metric data visualization using Recharts
- Real-time status cards with trend indicators
- System health monitoring (CPU, memory, storage usage)
- Alert configuration management

### External Integrations
- **Antares IoT Platform**: Primary sensor data source
- Integration service for fetching latest sensor readings
- Configurable API credentials and device management

### UI/UX Components
- Responsive design with mobile-first approach
- Dark/light theme support via CSS variables
- Toast notifications for user feedback
- Loading states and error handling

## Data Flow

1. **Sensor Data Collection**: Antares IoT service fetches data from external sensors
2. **Data Processing**: Backend validates and stores sensor readings
3. **API Layer**: RESTful endpoints serve data to frontend
4. **State Management**: React Query manages data fetching, caching, and synchronization
5. **Visualization**: Recharts renders real-time charts and graphs
6. **User Interaction**: Alert settings and system controls update via API calls

## External Dependencies

### Backend Dependencies
- `@neondatabase/serverless`: PostgreSQL serverless driver
- `drizzle-orm`: Type-safe database ORM
- `connect-pg-simple`: PostgreSQL session store
- `express`: Web framework
- `zod`: Runtime type validation

### Frontend Dependencies
- `@tanstack/react-query`: Server state management
- `@radix-ui/*`: Accessible UI primitives
- `recharts`: Data visualization library
- `tailwindcss`: Utility-first CSS framework
- `wouter`: Lightweight router
- `date-fns`: Date manipulation utilities

### Development Tools
- `vite`: Build tool and dev server
- `typescript`: Type checking
- `drizzle-kit`: Database migration tool
- `esbuild`: Server bundling

## Deployment Strategy

### Development Environment
- Vite dev server for frontend with HMR
- Express server with middleware for API routes
- In-memory data storage for rapid development
- Replit-specific configurations for cloud development

### Production Build
- Frontend: Vite builds optimized static assets
- Backend: ESBuild bundles server code for Node.js
- Database: PostgreSQL with Drizzle migrations
- Environment: Configurable via environment variables

### Key Configuration Files
- `vite.config.ts`: Frontend build and dev server configuration
- `drizzle.config.ts`: Database connection and migration settings
- `tsconfig.json`: TypeScript compiler options with path mapping
- `tailwind.config.ts`: CSS framework configuration with custom theme

The application is designed to be easily deployable on various platforms with minimal configuration changes, supporting both development and production environments through environment-specific settings.