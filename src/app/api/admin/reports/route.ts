import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    // Check authentication - only admins can access
    const { user, error } = requireAuth(request, ['admin']);
    if (!user) {
      return NextResponse.json(
        { error: error || 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'overview';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Default date range - last 30 days
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    const dateStart = startDate ? new Date(startDate) : defaultStartDate;
    const dateEnd = endDate ? new Date(endDate) : defaultEndDate;
    dateEnd.setHours(23, 59, 59, 999); // End of day

    switch (reportType) {
      case 'overview':
        const [
          totalRequests,
          approvedRequests,
          rejectedRequests,
          pendingRequests,
          requestsByStatus,
          requestsByDate,
          topRequesters,
          recentActivity
        ] = await Promise.all([
          // Total requests in date range
          prisma.visitorRequest.count({
            where: {
              createdAt: {
                gte: dateStart,
                lte: dateEnd
              }
            }
          }),

          // Approved requests
          prisma.visitorRequest.count({
            where: {
              status: 'approved',
              createdAt: {
                gte: dateStart,
                lte: dateEnd
              }
            }
          }),

          // Rejected requests
          prisma.visitorRequest.count({
            where: {
              status: 'rejected',
              createdAt: {
                gte: dateStart,
                lte: dateEnd
              }
            }
          }),

          // Pending requests
          prisma.visitorRequest.count({
            where: {
              status: {
                in: ['YET_TO_VERIFY', 'pending']
              },
              createdAt: {
                gte: dateStart,
                lte: dateEnd
              }
            }
          }),

          // Requests by status
          prisma.visitorRequest.groupBy({
            by: ['status'],
            _count: {
              id: true
            },
            where: {
              createdAt: {
                gte: dateStart,
                lte: dateEnd
              }
            }
          }),

          // Requests by date (daily breakdown)
          prisma.$queryRaw`
            SELECT 
              DATE(createdAt) as date,
              COUNT(*) as count,
              status
            FROM VisitorRequest 
            WHERE createdAt >= ${dateStart} AND createdAt <= ${dateEnd}
            GROUP BY DATE(createdAt), status
            ORDER BY date DESC
          `,

          // Top requesters
          prisma.visitorRequest.groupBy({
            by: ['userId'],
            _count: {
              id: true
            },
            where: {
              createdAt: {
                gte: dateStart,
                lte: dateEnd
              }
            },
            orderBy: {
              _count: {
                id: 'desc'
              }
            },
            take: 10
          }),

          // Recent activity
          prisma.visitorRequest.findMany({
            where: {
              createdAt: {
                gte: dateStart,
                lte: dateEnd
              }
            },
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  role: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 20
          })
        ]);

        // Get user details for top requesters
        const userIds = topRequesters.map(r => r.userId);
        const users = await prisma.user.findMany({
          where: {
            id: {
              in: userIds
            }
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        });

        const topRequestersWithDetails = topRequesters.map(requester => {
          const userDetails = users.find(u => u.id === requester.userId);
          return {
            ...requester,
            user: userDetails
          };
        });

        return NextResponse.json({
          success: true,
          data: {
            summary: {
              totalRequests,
              approvedRequests,
              rejectedRequests,
              pendingRequests,
              approvalRate: totalRequests > 0 ? ((approvedRequests / totalRequests) * 100).toFixed(1) : 0
            },
            chartData: {
              requestsByStatus: requestsByStatus.map(item => ({
                status: item.status,
                count: item._count.id
              })),
              requestsByDate: requestsByDate
            },
            topRequesters: topRequestersWithDetails,
            recentActivity: recentActivity.map(request => ({
              id: request.id,
              visitorName: request.visitorName,
              status: request.status,
              createdAt: request.createdAt,
              visitDate: request.visitDate,
              user: request.user
            }))
          }
        });

      case 'users':
        const [userStats, userActivity] = await Promise.all([
          // User statistics
          prisma.user.groupBy({
            by: ['role'],
            _count: {
              id: true
            }
          }),

          // User activity (requests per user)
          prisma.$queryRaw`
            SELECT 
              u.id,
              u.name,
              u.email,
              u.role,
              COUNT(vr.id) as requestCount,
              MAX(vr.createdAt) as lastRequestDate
            FROM User u
            LEFT JOIN VisitorRequest vr ON u.id = vr.userId
            WHERE vr.createdAt IS NULL OR (vr.createdAt >= ${dateStart} AND vr.createdAt <= ${dateEnd})
            GROUP BY u.id, u.name, u.email, u.role
            ORDER BY requestCount DESC
          `
        ]);

        return NextResponse.json({
          success: true,
          data: {
            userStats: userStats.map(stat => ({
              role: stat.role,
              count: stat._count.id
            })),
            userActivity
          }
        });

      case 'visitors':
        const [visitorStats, popularPurposes, guestHouseStats] = await Promise.all([
          // Visitor statistics
          prisma.$queryRaw`
            SELECT 
              COUNT(*) as totalVisitors,
              AVG(additionalVisitors + 1) as avgVisitorsPerRequest,
              MAX(additionalVisitors + 1) as maxVisitorsPerRequest
            FROM VisitorRequest 
            WHERE createdAt >= ${dateStart} AND createdAt <= ${dateEnd}
          `,

          // Popular visit purposes
          prisma.visitorRequest.groupBy({
            by: ['purpose'],
            _count: {
              id: true
            },
            where: {
              createdAt: {
                gte: dateStart,
                lte: dateEnd
              }
            },
            orderBy: {
              _count: {
                id: 'desc'
              }
            },
            take: 10
          }),

          // Guest house usage
          prisma.visitorRequest.groupBy({
            by: ['guestHouse'],
            _count: {
              id: true
            },
            where: {
              createdAt: {
                gte: dateStart,
                lte: dateEnd
              }
            }
          })
        ]);

        return NextResponse.json({
          success: true,
          data: {
            visitorStats: Array.isArray(visitorStats) ? visitorStats[0] : visitorStats,
            popularPurposes: popularPurposes.map(purpose => ({
              purpose: purpose.purpose,
              count: purpose._count.id
            })),
            guestHouseStats: guestHouseStats.map(stat => ({
              guestHouse: stat.guestHouse,
              count: stat._count.id
            }))
          }
        });

      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error generating reports:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
