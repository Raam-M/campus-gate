import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { user, error } = requireAuth(request, ['student']);
    if (!user) {
      return NextResponse.json(
        { error: error || 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch all requests for the authenticated user
    const requests = await prisma.visitorRequest.findMany({
      where: {
        userId: user.id
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format the response
    const formattedRequests = requests.map(request => ({
      id: request.id,
      visitorName: request.visitorName,
      relationship: request.relationship,
      mobile: request.mobile,
      vehicleType: request.vehicleType,
      vehicleNo: request.vehicleNo,
      additionalVisitors: request.additionalVisitors,
      visitDate: request.visitDate,
      visitTime: request.visitTime,
      purpose: request.purpose,
      guestHouse: request.guestHouse,
      guestHouseApprovalEmail: request.guestHouseApprovalEmail,
      status: request.status,
      qrCode: request.qrCode,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      user: request.user
    }));

    return NextResponse.json({
      success: true,
      requests: formattedRequests
    });

  } catch (error) {
    console.error('Error fetching student requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
