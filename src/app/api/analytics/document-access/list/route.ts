import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Endpoint to get document access logs for admin analytics
export async function GET(req: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin users can access analytics
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const documentId = url.searchParams.get('documentId') || undefined;
    const userId = url.searchParams.get('userId') || undefined;
    const startDate = url.searchParams.get('startDate') || undefined;
    const endDate = url.searchParams.get('endDate') || undefined;

    // Build filter conditions
    const where: any = {};
    
    if (documentId) {
      where.documentId = documentId;
    }
    
    if (userId) {
      where.userId = userId;
    }
    
    // Date range filter
    if (startDate || endDate) {
      where.accessStartTime = {};
      
      if (startDate) {
        where.accessStartTime.gte = new Date(startDate);
      }
      
      if (endDate) {
        where.accessStartTime.lte = new Date(endDate);
      }
    }

    // Get total count for pagination
    const totalCount = await prisma.documentAccessLog.count({ where });
    
    // Get paginated results with relations
    const logs = await prisma.documentAccessLog.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { accessStartTime: 'desc' },
      include: {
        document: {
          select: {
            name: true,
            mimeType: true,
            size: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    // Get summary statistics using Prisma aggregations
    const totalViews = await prisma.documentAccessLog.count({ where });
    
    const uniqueDocuments = await prisma.documentAccessLog.groupBy({
      by: ['documentId'],
      where
    }).then(results => results.length);
    
    const uniqueUsers = await prisma.documentAccessLog.groupBy({
      by: ['userId'],
      where: {
        ...where,
        userId: { not: null }
      }
    }).then(results => results.length);
    
    const uniqueVisitors = await prisma.documentAccessLog.groupBy({
      by: ['visitorToken'],
      where: {
        ...where,
        visitorToken: { not: null }
      }
    }).then(results => results.length);
    
    // Get average and max duration
    const durationStats = await prisma.documentAccessLog.aggregate({
      where: {
        ...where,
        duration: { not: null }
      },
      _avg: { duration: true },
      _max: { duration: true }
    });
    
    const stats = {
      totalViews,
      uniqueDocuments,
      uniqueUsers,
      uniqueVisitors,
      avgDurationSeconds: durationStats._avg.duration || 0,
      maxDurationSeconds: durationStats._max.duration || 0
    };

    // Get top documents by views
    const topDocuments = await prisma.documentAccessLog.groupBy({
      by: ['documentId'],
      _count: {
        documentId: true
      },
      orderBy: {
        _count: {
          documentId: 'desc'
        }
      },
      take: 5,
      where
    });

    // Get document details for top documents
    const topDocumentsWithDetails = await Promise.all(
      topDocuments.map(async (doc) => {
        const document = await prisma.document.findUnique({
          where: { id: doc.documentId },
          select: { name: true }
        });
        return {
          documentId: doc.documentId,
          name: document?.name || 'Unknown',
          views: doc._count.documentId
        };
      })
    );

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      stats: stats[0],
      topDocuments: topDocumentsWithDetails
    });
  } catch (error) {
    console.error('Error fetching document access logs:', error);
    return NextResponse.json({ error: 'Failed to fetch document access logs' }, { status: 500 });
  }
}
