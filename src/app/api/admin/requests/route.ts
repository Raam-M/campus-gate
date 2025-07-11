import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

// Mock SendGrid function for now
async function sendEmailMock(to: string, subject: string, html: string) {
  console.log('=== MOCK EMAIL ===');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('HTML:', html);
  console.log('==================');
  return Promise.resolve();
}

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
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    // Fetch requests with pagination
    const [requests, totalCount] = await Promise.all([
      prisma.visitorRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.visitorRequest.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        requests,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching admin requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check authentication - only admins can update
    const { user, error } = requireAuth(request, ['admin']);
    if (!user) {
      return NextResponse.json(
        { error: error || 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { requestId, action, reason } = body;

    if (!requestId || !action) {
      return NextResponse.json(
        { error: 'Request ID and action are required' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Use "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Find the request
    const visitorRequest = await prisma.visitorRequest.findUnique({
      where: { id: parseInt(requestId) },
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
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    let updateData: any = {
      status: action === 'approve' ? 'approved' : 'rejected',
      updatedAt: new Date()
    };

    // If approving, generate QR code
    if (action === 'approve') {
      const qrCodeData = {
        requestId: visitorRequest.id,
        visitorName: visitorRequest.visitorName,
        visitDate: visitorRequest.visitDate,
        uniqueId: uuidv4(),
        approvedBy: user.name,
        approvedAt: new Date().toISOString()
      };

      // Generate QR code as data URL
      const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrCodeData));
      updateData.qrCode = qrCodeUrl;

      // Send approval email with QR code
      const approvalEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Visitor Request Approved!</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #374151; margin-top: 0;">Request Details</h2>
            <p><strong>Visitor Name:</strong> ${visitorRequest.visitorName}</p>
            <p><strong>Visit Date:</strong> ${new Date(visitorRequest.visitDate).toLocaleDateString()}</p>
            <p><strong>Visit Time:</strong> ${visitorRequest.visitTime}</p>
            <p><strong>Purpose:</strong> ${visitorRequest.purpose}</p>
            <p><strong>Approved by:</strong> ${user.name}</p>
          </div>

          <div style="background: white; padding: 30px; border: 2px solid #e5e7eb; border-radius: 10px; text-align: center;">
            <h3 style="color: #374151; margin-top: 0;">Your QR Code</h3>
            <p style="color: #6b7280; margin-bottom: 20px;">Show this QR code at the campus entrance</p>
            <img src="${qrCodeUrl}" alt="Visitor QR Code" style="max-width: 200px; height: auto; border: 1px solid #e5e7eb; border-radius: 8px;">
            <p style="color: #dc2626; font-size: 14px; margin-top: 20px;">
              <strong>Important:</strong> This QR code is valid only for the approved visit date and time.
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #fef3c7; border-radius: 8px;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              Please carry a valid ID along with this QR code. Visitors must arrive within ±1 hour of the scheduled time.
            </p>
          </div>
        </div>
      `;

      await sendEmailMock(
        visitorRequest.user.email,
        'Visitor Request Approved - Your QR Code',
        approvalEmailHtml
      );

    } else {
      // Send rejection email
      const rejectionEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Visitor Request Update</h1>
          </div>
          
          <div style="background: #fef2f2; padding: 30px; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #374151; margin-top: 0;">Request Status: Rejected</h2>
            <p><strong>Visitor Name:</strong> ${visitorRequest.visitorName}</p>
            <p><strong>Visit Date:</strong> ${new Date(visitorRequest.visitDate).toLocaleDateString()}</p>
            <p><strong>Visit Time:</strong> ${visitorRequest.visitTime}</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          </div>

          <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              If you have questions about this decision, please contact the administration office.
            </p>
          </div>
        </div>
      `;

      await sendEmailMock(
        visitorRequest.user.email,
        'Visitor Request Update - Status Changed',
        rejectionEmailHtml
      );
    }

    // Update the request
    const updatedRequest = await prisma.visitorRequest.update({
      where: { id: parseInt(requestId) },
      data: updateData,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Request ${action}d successfully`,
      data: updatedRequest
    });

  } catch (error) {
    console.error('Error updating request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
