# Campus Gate Visitor Management System – Step-by-Step Development Plan

## 1. Project Initialization

### 1.1. Create Next.js App (with TypeScript)
- **Command:**
  ```bash
  npx create-next-app@15.3.5 campus-gate --typescript --use-npm
  cd campus-gate
  ```
  *(Check for latest version at https://www.npmjs.com/package/next)*

### 1.2. Initialize Git
- **Command:**
  ```bash
  git init
  ```

## 2. Install Dependencies

### 2.1. Tailwind CSS (for responsive UI)
- **Command:**
  ```bash
  npm install -D tailwindcss postcss autoprefixer
  npx tailwindcss init -p
  ```
- **Configure Tailwind:**
  - Update `tailwind.config.js` to include all project paths.
  - Add orange/white color palette in the theme section.
  - Add Tailwind directives to `globals.css`:
    ```css
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    ```

### 2.2. SQLite & Prisma ORM
- **Command:**
  ```bash
  npm install @prisma/client
  npm install -D prisma
  npx prisma init --datasource-provider sqlite
  ```
- **Configure database in `.env` (default: `prisma/dev.db`).**

### 2.3. Additional Packages
- **QR Code Generation:**
  - `qrcode.react` or `qrcode`
    ```bash
    npm install qrcode.react
    ```
- **SMS/Email Notifications:**
  - Choose a provider (e.g., Twilio, SendGrid) and install SDK as needed.
- **Image Uploads:**
  - `next-cloudinary` or similar for vehicle/guest house email attachments.

## 3. Project Structure

- `/pages` – Next.js routes (dashboard, login, admin, security, etc.)
- `/components` – Reusable UI components (forms, tables, modals, QR, etc.)
- `/lib` – Utility functions (QR, SMS, ANPR, etc.)
- `/prisma` – Prisma schema and migrations
- `/styles` – Tailwind and global styles
- `/types` – TypeScript types/interfaces

## 4. Database Design

- **Edit `prisma/schema.prisma`** to define models:
  - User (roles: admin, normal, security, sub-categories)
  - VisitorRequest (fields per requirements)
  - GuestHouseApproval
  - QRCode
  - VisitLog
  - Vehicle (for ANPR)
- **Run migration:**
  ```bash
  npx prisma migrate dev --name init
  ```

## 5. Authentication & Authorization
- Import the college's student and staff database into the application's User table (via CSV, Excel, or direct DB import).
- For authentication, implement a login system that matches user credentials (e.g., email and password) against the imported User records.
- Add a process to update the User table annually (or as needed) with new batch/student/staff data.
- Configure role-based access in session after login (admin, student, staff, etc.).

## 6. Feature Implementation

### 6.1. Normal User Dashboard
- **New Visitor Pass Request:**
  - Form with all required fields and validations.
  - Guest House logic: file upload, approval flow.
  - Non-guest house: QR generation, SMS dispatch.
- **Current Active Requests:**
  - List, view, edit, delete requests.
- **Past Requests:**
  - Read-only history with status.

### 6.2. Admin Dashboard
- **Pending Approvals:**
  - View, approve/reject guest house requests, add comments, send notifications.
- **All Active Requests:**
  - List and view all open requests.
- **Report Generation:**
  - Filter/export data.
- **Alert Notification:**
  - Send campus-wide or targeted alerts via SMS/email.

### 6.3. Security Workflow
- **QR Code Scan:**
  - Display visitor data, allow edits, photo upload, verify entry.
- **Exit Gate:**
  - QR used for exit, exit time recorded, status updated.
- **ANPR Integration:**
  - Integrate number plate recognition for vehicle entry.

### 6.4. Special Functionalities
- **QR Code Handling:**
  - Generated on submission/approval, sent to visitor, valid for correct duration.
- **Auto Cleanup:**
  - Scheduled job to delete/deactivate open requests older than 7 days.

## 7. UI/UX & Theming
- Use Tailwind for all styling.
- Set primary color to orange, secondary/neutral to white.
- Ensure responsive design for all pages.

## 8. Testing
- Unit tests for components and utilities.
- Integration tests for API routes.
- Use Jest/React Testing Library.

## 9. Running the Application
- **Development:**
  ```bash
  npm run dev
  ```
- **Build for production:**
  ```bash
  npm run build
  npm start
  ```

## 10. Deployment
- Deploy on Vercel, Netlify, or your own server.
- Set up environment variables for production.

## 11. Documentation
- Update `README.md` with setup, usage, and contribution guidelines.

---

### References
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
