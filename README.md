: Visitor Management System

A comprehensive visitor management system for colleges, featuring a modern front end and robust backend.

## Features

### User Roles

- **Admin**
    - View all data, generate reports, and approve/reject requests.
- **Normal User**
    - Sub-categories: Student, Teaching Staff, Non-Teaching Staff, Others (e.g., shopkeepers).
    - Can view their own info, create/edit/delete visitor pass requests, view past requests, and check approval status.

### Authentication

- Login with college ID and password for all users.

---

## Normal User Dashboard

1. **New Visitor Pass Request Creation**
2. **Current Active Requests**
3. **View All Past Requests**

### 1. New Visitor Pass Request Creation

Form fields:
- Name of visitor (text, required)
- Relationship (dropdown: father, mother, sibling, family member; required)
- Mobile Number (numeric, required)
- Type of Vehicle (dropdown: None, Not Known, Two Wheeler, Three Wheeler, Car, Jeep, Van; required)
- Vehicle Number (text, optional)
- Number of additional visitors (dropdown: 0–10; required)
- Date of visit (calendar, today or next 10 days; required)
- Tentative time of visit (dropdown, hour:minute; if today, only times after current hour; required)
- Purpose of visit (text, required)
- Stay planned in Guest House (dropdown: yes/no; required)

**If 'yes' for Guest House:**
- Attach Guest House stay approval email
- 'Send for approval' button (saves request, notifies admin, shows confirmation popup)

**If 'no' for Guest House:**
- 'Submit' button (saves request, displays QR code, sends to visitor's mobile)

---

### 2. Current Active Requests

- List of open requests (latest first)
- Fields: Date, Time, Visitor Type, Name
- Actions: View Details (read-only, includes QR), Edit (update fields, save changes), Delete (confirmation popup)

---

### 3. View All Past Requests

- List of all requests (latest first)
- Fields: Date, Time, Name, Status (Open/Closed)
- Action: View Details (read-only)

---

## Admin Dashboard

1. **Pending Approvals**
2. **All Active Requests**
3. **Report Generation**
4. **Alert Notification**

### 1. Pending Approvals

- List of pending requests (oldest first)
- View Details (includes Guest House email)
- Actions: Approve (sends QR to visitor, notifies user), Reject (closes request, sends SMS to user), Comments box

---

### 2. All Active Requests

- List of all active requests (ascending by visit date/time)
- View Details

---

## Security Workflow

- Security scans QR code to view visitor details.
- Can update vehicle info, attach vehicle photo, and verify entry.
- Open requests older than 7 days auto-deleted; QR becomes invalid.
- QR code valid for same day only (unless Guest House booking).
- Tracks entry/exit counts per QR.
- Guest House QR valid until booking closure.
- Exit updates record with exit date/time.
- Non-Guest House QR codes expire next day; status set to Closed.
