import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getOrganizerDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const organizerId = req.user.id;
    const { year = new Date().getFullYear(), month } = req.query;

    // Get basic statistics
    const totalEvents = await prisma.event.count({
      where: { organizer_id: organizerId }
    });

    const totalTransactions = await prisma.transaction.count({
      where: { 
        event: { organizer_id: organizerId },
        status: 'done'
      }
    });

    const totalRevenue = await prisma.transaction.aggregate({
      where: { 
        event: { organizer_id: organizerId },
        status: 'done'
      },
      _sum: { final_amount: true }
    });

    // Get events data for charts
    const eventsByMonth = await prisma.event.groupBy({
      by: ['created_at'],
      where: { 
        organizer_id: organizerId,
        created_at: {
          gte: new Date(Number(year), 0, 1),
          lt: new Date(Number(year) + 1, 0, 1)
        }
      },
      _count: { id: true }
    });

    const revenueByMonth = await prisma.transaction.groupBy({
      by: ['created_at'],
      where: { 
        event: { organizer_id: organizerId },
        status: 'done',
        created_at: {
          gte: new Date(Number(year), 0, 1),
          lt: new Date(Number(year) + 1, 0, 1)
        }
      },
      _sum: { final_amount: true }
    });

    // Get recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: { event: { organizer_id: organizerId } },
      include: {
        user: { select: { full_name: true, email: true } },
        event: { select: { title: true } },
        transaction_items: { include: { ticket_type: true } }
      },
      orderBy: { created_at: 'desc' },
      take: 10
    });

    // Get upcoming events
    const upcomingEvents = await prisma.event.findMany({
      where: { 
        organizer_id: organizerId,
        start_date: { gt: new Date() }
      },
      include: {
        category: true,
        _count: {
          select: { transactions: { where: { status: 'done' } } }
        }
      },
      orderBy: { start_date: 'asc' },
      take: 5
    });

    res.json({
      statistics: {
        total_events: totalEvents,
        total_transactions: totalTransactions,
        total_revenue: totalRevenue._sum.final_amount || 0
      },
      charts: {
        events_by_month: eventsByMonth,
        revenue_by_month: revenueByMonth
      },
      recent_transactions: recentTransactions,
      upcoming_events: upcomingEvents
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getEventAttendees = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user.id;

    // Verify event belongs to organizer
    const event = await prisma.event.findFirst({
      where: { id: eventId, organizer_id: organizerId }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const attendees = await prisma.eventAttendee.findMany({
      where: { event_id: eventId },
      include: {
        user: { select: { full_name: true, email: true } },
        transaction: { 
          include: { 
            transaction_items: { include: { ticket_type: true } }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json({ attendees });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};