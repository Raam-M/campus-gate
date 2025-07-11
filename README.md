# Campus Gate Visitor Management System

A comprehensive digital visitor management system designed for educational institutions to streamline visitor registration, approval workflows, and security operations. Built with modern web technologies including Next.js 15.3.5, TypeScript, Tailwind CSS, and Prisma ORM.

## Project Overview

The Campus Gate Visitor Management System provides a robust platform for managing visitor access to college premises through an integrated workflow involving students, staff, administrators, and security personnel. The system incorporates QR code generation, SMS notifications and guest house approval workflows.

## System Architecture

- **Frontend**: Next.js 15.3.5 with TypeScript and App Router
- **Styling**: Tailwind CSS with custom orange/white theme
- **Database**: SQLite with Prisma ORM
- **Authentication**: College ID-based login system
- **Notifications**: SMS integration via Twilio
- **File Uploads**: Cloudinary integration
- **QR Code Generation**: qrcode.react library

## User Categories

### Normal Users
- **Students**: Current enrolled students
- **Teaching Staff**: Faculty and academic personnel  
- **Non-Teaching Staff**: Administrative and support staff
- **Others**: External stakeholders (shop keepers, vendors, etc.)

### Administrative Users
- **Admin**: Full system access with approval authorities
- **Security Personnel**: Entry/exit verification and ANPR operations

## Core Features

### Normal User Capabilities

#### 1. New Visitor Pass Request Creation
Users can create visitor requests with the following mandatory fields:
- **Visitor Information**: Name, relationship (father/mother/sibling/family member), mobile number
- **Vehicle Details**: Type (None/Not Known/Two Wheeler/Three Wheeler/Car/Jeep/Van), optional vehicle number
- **Visit Details**: Date (current + 10 days), time (minimum 1 hour from current time), purpose
- **Additional Visitors**: Count (0-10 persons)
- **Guest House Stay**: Yes/No selection with conditional approval workflow

**Guest House Workflow**: 
- Upload approval email attachment
- Admin approval required before QR generation
- Automated approval notifications

**Standard Workflow**:
- Immediate QR code generation upon submission
- Automatic SMS dispatch to visitor's mobile

#### 2. Current Active Requests Management
- View all open requests sorted by visit date/time
- **Actions Available**: View Details, Edit, Delete
- Real-time status tracking
- Comprehensive request modification capabilities

#### 3. Historical Request Tracking
- Complete history of past requests
- Status indicators (Open/Closed)
- Read-only detailed view functionality

### Administrative Features

#### 1. Pending Approvals Management
- Queue-based approval system for guest house requests
- Detailed review with attachment viewing
- Approve/Reject workflow with comment capabilities
- Automated notification dispatch

#### 2. Active Request Monitoring
- System-wide view of all active visitor requests
- Chronological sorting by visit date/time
- Comprehensive request details access

#### 3. Report Generation
- Data export capabilities
- Filtering and analytics tools
- Comprehensive visitor statistics

#### 4. Alert Notification System
- Campus-wide or targeted communication
- SMS/Email broadcast capabilities
- Emergency notification protocols

### Security Operations

#### QR Code Verification Workflow
- Mobile QR scanner integration
- Visitor detail verification and updates
- Vehicle information confirmation with photo capture
- Entry authorization with timestamp logging

#### Exit Gate Processing
- Same QR code validation for exit
- Exit time recording
- Status update automation

## System Rules and Validations

### QR Code Management
- **Validity Period**: Same-day validity for standard requests
- **Guest House Exceptions**: Extended validity until booking closure date
- **Auto-Expiry**: 7-day automatic deletion of unused requests
- **Entry/Exit Tracking**: Multiple entry support for guest house bookings

### Security Protocols
- College ID-based authentication system
- Role-based access control (RBAC)
- Automated cleanup of expired requests
- Invalid QR code prevention mechanisms

### Notification System
- Real-time SMS notifications for request status updates
- Email notifications for administrative actions
- Automated rejection/approval confirmations
- System-generated alerts for expired requests

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Raam-M/campus-gate.git
cd campus-gate
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Configure your database and API keys
```

4. Initialize the database:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Database Schema

The system utilizes the following core entities:
- **Users**: Student/staff information with role assignments
- **VisitorRequests**: Complete visitor request lifecycle
- **QRCodes**: Generated codes with validation metadata
- **VisitLogs**: Entry/exit tracking records
- **GuestHouseApprovals**: Approval workflow management

## API Documentation

Detailed API documentation is available in the `/docs` directory, covering:
- Authentication endpoints
- Visitor request management
- Admin approval workflows
- QR code generation and validation
- Notification services

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For technical support or feature requests, please create an issue in the GitHub repository or contact the development team.

## Acknowledgments

- Next.js team for the robust framework
- Prisma for excellent database tooling
- Tailwind CSS for utility-first styling
- Contributors and maintainers of all open-source dependencies