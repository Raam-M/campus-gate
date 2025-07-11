import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { user, error } = requireAuth(request, ['student']);
    if (!user) {
      return NextResponse.json(
        { error: error || 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json()
    
    // Extract form data
    const {
      visitorName,
      visitorEmail,
      visitorPhone,
      relationship,
      customRelationship,
      purposeOfVisit,
      visitDate,
      visitTime,
      numberOfVisitors,
      stayingInGuestHouse,
      additionalNotes
    } = body

    // Validate required fields
    if (!visitorName || !visitorEmail || !visitorPhone || !relationship || !purposeOfVisit || !visitDate || !visitTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate phone number format
    const phoneRegex = /^[6-9]\d{9}$/
    if (!phoneRegex.test(visitorPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    // Validate visit date (should be today or future)
    const visitDateTime = new Date(visitDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (visitDateTime < today) {
      return NextResponse.json(
        { error: 'Visit date cannot be in the past' },
        { status: 400 }
      )
    }

    // Determine the final relationship value
    const finalRelationship = relationship === 'Other' ? customRelationship : relationship

    // Convert numberOfVisitors to integer
    let additionalVisitors = 0
    if (numberOfVisitors !== '1') {
      if (numberOfVisitors === '5+') {
        additionalVisitors = 4 // 5+ means at least 4 additional visitors
      } else {
        additionalVisitors = parseInt(numberOfVisitors) - 1
      }
    }

    // Create the visitor request
    const visitorRequest = await prisma.visitorRequest.create({
      data: {
        visitorName,
        relationship: finalRelationship,
        mobile: visitorPhone,
        vehicleType: '', // Not collected in the form, can be added later
        vehicleNo: null, // Not collected in the form, can be added later
        additionalVisitors,
        visitDate: visitDateTime,
        visitTime,
        purpose: purposeOfVisit,
        guestHouse: stayingInGuestHouse === 'Yes',
        guestHouseApprovalEmail: stayingInGuestHouse === 'Yes' ? visitorEmail : null,
        status: 'YET_TO_VERIFY',
        qrCode: null, // Will be generated after admin approval
        userId: user.id
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

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Visitor request submitted successfully',
      data: {
        id: visitorRequest.id,
        status: visitorRequest.status,
        createdAt: visitorRequest.createdAt
      }
    })

  } catch (error) {
    console.error('Error creating visitor request:', error)
    
    // Handle Prisma errors
    if (error instanceof Error) {
      // Check for foreign key constraint error (invalid userId)
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { error: 'Invalid user ID' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    // Get all visitor requests for the authenticated user
    const requests = await prisma.visitorRequest.findMany({
      where: {
        userId: user.id
      },
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

    return NextResponse.json({
      success: true,
      data: requests
    })

  } catch (error) {
    console.error('Error fetching visitor requests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
