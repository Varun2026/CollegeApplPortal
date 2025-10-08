# End-to-End Data Encryption System for College Applications

## Project Overview
A full-stack web application for secure college application submissions using client-side AES-GCM 256-bit encryption. This is a demo version showcasing end-to-end encryption capabilities with plans for Azure Key Vault integration.

## Tech Stack
- **Frontend**: React + TypeScript, Tailwind CSS, Wouter (routing)
- **Backend**: Node.js + Express
- **Encryption**: Web Crypto API (AES-GCM 256-bit)
- **State Management**: TanStack Query
- **Form Handling**: React Hook Form + Zod validation

## Key Features
- ✅ Multi-step application form (Personal Info → Academic Info → Documents → Review)
- ✅ Client-side AES-GCM encryption with random IV generation
- ✅ File upload validation (PDF/JPG, max 10MB)
- ✅ Professional responsive UI with progress indicators
- ✅ Admin dashboard with decrypt functionality
- ✅ Dark/Light theme support
- ✅ Comprehensive form validation

## Architecture
```
/client          - React frontend application
  /src
    /components  - Reusable UI components
    /lib         - Utilities (encryption, query client)
    /hooks       - Custom React hooks
/server          - Express backend (to be implemented)
/shared          - Shared types and schemas
```

## Security Features
- Random IV generation for each encryption
- AES-GCM 256-bit encryption
- File type and size validation
- Client-side encryption before transmission
- Demo key (production will use Azure Key Vault)

## Current Status
**Phase 1: Frontend Prototype** ✅ Complete
- All UI components built
- Encryption utilities implemented
- Multi-step form with validation
- Admin dashboard interface

**Phase 2: Backend Implementation** 🔄 Next
- Express API routes
- File storage in applications.json
- Admin endpoints for decryption
- Error handling and logging

## Recent Changes
- 2025-10-08: Initial frontend prototype completed
  - Built ApplicationForm component with 4-step wizard
  - Created AdminDashboard with decrypt functionality
  - Implemented EncryptUtils module with Web Crypto API
  - Added theme support and header navigation
  - Set up design system with Tailwind + custom utilities
