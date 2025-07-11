import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const qrId = searchParams.get('qr');

    if (!qrId) {
      return NextResponse.json(
        { error: 'QR code ID is required' },
        { status: 400 }
      );
    }

    // Find the visitor request by QR code
    const visitorRequest = await prisma.visitorRequest.findFirst({
      where: {
        qrCode: qrId,
        status: 'APPROVED'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!visitorRequest) {
      return NextResponse.json(
        { error: 'Invalid or expired QR code', valid: false },
        { status: 404 }
      );
    }

    // Check if the visit date is today or in the future
    const visitDate = new Date(visitorRequest.visitDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    visitDate.setHours(0, 0, 0, 0);

    if (visitDate < today) {
      return NextResponse.json(
        { error: 'QR code has expired (visit date has passed)', valid: false },
        { status: 400 }
      );
    }

    // Check if the visit is for today and within time bounds (assuming 9 AM to 6 PM allowed)
    const now = new Date();
    const currentHour = now.getHours();
    const isToday = visitDate.getTime() === today.getTime();

    if (isToday && (currentHour < 9 || currentHour > 18)) {
      return NextResponse.json(
        { error: 'QR code can only be used during visit hours (9 AM - 6 PM)', valid: false },
        { status: 400 }
      );
    }

    // Parse visitor details - using additionalVisitors count since we don't store individual visitor details
    const visitors = Array.from({ length: visitorRequest.additionalVisitors }, (_, i) => ({
      name: `Visitor ${i + 2}`, // Since main visitor is #1
      relationship: 'Additional Visitor'
    }));

    return NextResponse.json({
      valid: true,
      request: {
        id: visitorRequest.id,
        visitorName: visitorRequest.visitorName,
        mobile: visitorRequest.mobile,
        purpose: visitorRequest.purpose,
        visitDate: visitorRequest.visitDate,
        visitTime: visitorRequest.visitTime,
        additionalVisitors: visitorRequest.additionalVisitors,
        vehicleType: visitorRequest.vehicleType,
        vehicleNo: visitorRequest.vehicleNo,
        guestHouse: visitorRequest.guestHouse,
        visitors: visitors,
        requestedBy: visitorRequest.user,
        createdAt: visitorRequest.createdAt,
        approvedAt: visitorRequest.updatedAt
      }
    });

  } catch (error) {
    console.error('QR verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify QR code', valid: false },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated (security staff should also be able to access this)
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { qrId, action } = await request.json();

    if (!qrId || !action) {
      return NextResponse.json(
        { error: 'QR code ID and action are required' },
        { status: 400 }
      );
    }

    // Find the visitor request
    const visitorRequest = await prisma.visitorRequest.findFirst({
      where: {
        qrCode: qrId,
        status: 'APPROVED'
      }
    });

    if (!visitorRequest) {
      return NextResponse.json(
        { error: 'Invalid QR code' },
        { status: 404 }
      );
    }

    if (action === 'checkin') {
      // Log the check-in (you could create a separate table for visitor logs)
      // For now, we'll just return success
      return NextResponse.json({
        message: 'Visitor checked in successfully',
        checkedInAt: new Date().toISOString()
      });
    } else if (action === 'checkout') {
      // Log the check-out
      return NextResponse.json({
        message: 'Visitor checked out successfully',
        checkedOutAt: new Date().toISOString()
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "checkin" or "checkout"' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('QR action error:', error);
    return NextResponse.json(
      { error: 'Failed to process QR action' },
      { status: 500 }
    );
  }
}
