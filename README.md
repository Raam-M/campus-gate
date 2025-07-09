# campus-gate
## Visitor Management System - Requirements Specification

### 1. Introduction

#### 1.1 Purpose
Design and develop a Visitor Management System for a college to ensure secure, trackable, and streamlined management of visitor entry, approval, and reporting, supporting multiple user types.

#### 1.2 Scope
The system supports the following user roles:
- **Admin User**
- **Normal User** (sub-categorized as Student, Teaching Staff, Non-Teaching Staff, Others)

---

### 2. User Roles and Access Control

| Role           | Access Level                                                                 |
|----------------|------------------------------------------------------------------------------|
| Admin          | View all data, approve/reject requests, generate reports, send alerts         |
| Normal User    | Create/view/edit/delete own requests, check statuses                          |
| Security Staff | Scan QR code, verify visitor, update visit details at gate, record exit time  |

---

### 3. Functional Requirements

#### Normal User Dashboard
- **New Visitor Pass Request Creation**
- **Current Active Requests**
- **View All Requests from Past**

##### New Visitor Pass Request Creation
- Form with validations: visitor name, relationship, mobile number, vehicle type/number, date/time of visit, purpose, guest house stay.
- Guest House logic: approval flow.
- Non-guest house: QR generation and SMS dispatch.

##### Current Active Requests
- List of active requests with options to view, edit, or delete.

##### View All Requests from Past
- Read-only history of past requests with statuses.

#### Admin Dashboard
- **Pending Approvals**
- **All Active Requests**
- **Report Generation**
- **Alert Notification**

##### Pending Approvals
- View, approve/reject guest house stay requests with comments and notifications.

##### All Active Requests
- List and view all open requests.

##### Report Generation
- Filter and export based on various criteria.

##### Alert Notification
- Campus-wide or targeted alerts via SMS/email.

---

### 4. Special Functionalities

- **QR Code Handling:** Generated upon submission/approval, sent to visitor, valid for same day or guest house stay duration.
- **Gate Verification:** QR scan displays visitor data, allows edits, photo upload, and verification.
- **Exit Gate:** QR used for exit, exit time recorded, status updated.
- **Auto Cleanup:** Open requests older than 7 days are auto-deleted and deactivated.

---

### 5. Non-Functional Requirements

- **Authentication:** Integrated with college ID
- **Security:** SSL, role-based access, QR validation
- **Availability:** 24/7 with backup
- **Performance:** Supports 500 concurrent users
- **Scalability:** Easy feature/role addition
- **Cost Optimization:** Open-source tech stack

---

### 6. Future Enhancements

- ANPR Integration (Number Plate Recognition)
- Biometric or facial recognition
- Email notification support
- Visitor feedback collection