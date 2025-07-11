import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    // Check authentication - only admins can access dashboard stats
    const { user, error } = requireAuth(request, ['admin']);
    if (!user) {
      return NextResponse.json(
        { error: error || 'Authentication required' },
        { status: 401 }
      );
    }

    // Get current date for filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch statistics
    const [
      pendingRequests,
      approvedToday,
      totalRequests,
      activeVisitors,
      allRequests
    ] = await Promise.all([
      // Pending requests (YET_TO_VERIFY + pending)
      prisma.visitorRequest.count({
        where: {
          status: {
            in: ['YET_TO_VERIFY', 'pending']
          }
        }
      }),

      // Approved today
      prisma.visitorRequest.count({
        where: {
          status: 'approved',
          updatedAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),

      // Total requests
      prisma.visitorRequest.count(),

      // Active visitors (approved requests for today or future)
      prisma.visitorRequest.count({
        where: {
          status: 'approved',
          visitDate: {
            gte: today
          }
        }
      }),

      // Recent requests for activity feed
      prisma.visitorRequest.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          pendingRequests,
          approvedToday,
          totalRequests,
          activeVisitors
        },
        recentRequests: allRequests.map(request => ({
          id: request.id,
          visitorName: request.visitorName,
          status: request.status,
          createdAt: request.createdAt,
          visitDate: request.visitDate,
          user: request.user
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
