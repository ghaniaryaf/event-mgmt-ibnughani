import { Prisma, Event, EventTicketType, TransactionStatus } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { EventFilterParams } from '../types';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary';

export class EventService {
  async getEvents(filters: EventFilterParams) {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      location,
      startDate,
      endDate,
      minPrice,
      maxPrice,
    } = filters;

    const skip = (page - 1) * limit;

    // FIX: Gunakan contains + insensitive yang benar untuk Prisma
    const filtersArray: Prisma.EventWhereInput[] = [
      { isPublished: true }, // FIX: Tambah published filter
      { isDeleted: false }   // FIX: Exclude deleted events
    ];

    if (search) {
      filtersArray.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (category) {
      filtersArray.push({ category: { contains: category, mode: 'insensitive' } });
    }

    if (location) {
      filtersArray.push({ location: { contains: location, mode: 'insensitive' } });
    }

    if (startDate) {
      filtersArray.push({ startDate: { gte: new Date(startDate) } });
    }

    if (endDate) {
      filtersArray.push({ endDate: { lte: new Date(endDate) } });
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter: Prisma.FloatFilter = {};
      if (minPrice !== undefined) priceFilter.gte = minPrice;
      if (maxPrice !== undefined) priceFilter.lte = maxPrice;
      filtersArray.push({ basePrice: priceFilter });
    }

    const where: Prisma.EventWhereInput = {
      AND: filtersArray,
    };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          organizer: {
            select: {
              id: true,
              fullName: true,
              profilePicture: true,
              // FIX: Jangan include email/phone untuk public API
            },
          },
          ticketTypes: true,
          _count: {
            select: {
              reviews: true,
              attendees: true,
            },
          },
        },
        orderBy: { startDate: 'asc' },
        skip,
        take: limit,
      }),
      prisma.event.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getEventById(id: string) {
    return prisma.event.findUnique({
      where: { 
        id,
        isDeleted: false // FIX: Exclude deleted events
      },
      include: {
        organizer: {
          select: {
            id: true,
            fullName: true,
            profilePicture: true,
            // FIX: Jangan include sensitive data
          },
        },
        ticketTypes: true,
        vouchers: {
          where: {
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
            // FIX: Akses maxUsage yang benar
            usedCount: { 
              lt: prisma.eventVoucher.fields.maxUsage 
            },
            isDeleted: false,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                profilePicture: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            attendees: true,
            reviews: true,
          },
        },
      },
    });
  }

  // FIX: Create event dengan rollback mechanism dan validasi
  async createEvent(
    organizerId: string,
    eventData: {
      title: string;
      description: string;
      category: string;
      location: string;
      address: string;
      startDate: Date;
      endDate: Date;
      availableSeats: number;
      basePrice: number;
      isPublished: boolean;
      imageUrl?: string;
    },
    ticketTypes: {
      name: string;
      price: number;
      quantity: number;
      description?: string;
    }[],
    imageFile?: Express.Multer.File
  ) {
    // FIX: Validasi data event
    this.validateEventData(eventData);

    let imageUrl = eventData.imageUrl;
    let cloudinaryPublicId: string | undefined;

    return await prisma.$transaction(async (tx) => {
      try {
        // FIX: Upload image dengan rollback mechanism
        if (imageFile) {
          try {
            console.log('📸 Uploading event image to Cloudinary...');
            const uploadResult = await uploadToCloudinary(imageFile);
            imageUrl = uploadResult.secure_url;
            cloudinaryPublicId = uploadResult.public_id;
            console.log('Event image uploaded:', imageUrl);
          } catch (error) {
            console.error('Failed to upload event image:', error);
            throw new Error('Failed to upload event image');
          }
        }

        // FIX: Check duplicate event title untuk organizer yang sama
        const existingEvent = await tx.event.findFirst({
          where: {
            title: { 
              contains: eventData.title, 
              mode: 'insensitive' 
            },
            organizerId,
            isDeleted: false
          }
        });

        if (existingEvent) {
          throw new Error('Event with this title already exists');
        }

        const event = await tx.event.create({
          data: {
            title: eventData.title,
            description: eventData.description,
            category: eventData.category,
            location: eventData.location,
            address: eventData.address,
            startDate: eventData.startDate,
            endDate: eventData.endDate,
            availableSeats: eventData.availableSeats,
            basePrice: eventData.basePrice,
            isPublished: eventData.isPublished,
            imageUrl,
            imagePublicId: cloudinaryPublicId, // FIX: Store public_id untuk future deletion
            organizerId,
            bookedSeats: 0, // Initialize
            soldQuantity: 0, // Initialize sold quantity
            isDeleted: false,
          },
        });

        // FIX: Create ticket types dengan available quantity
        if (ticketTypes && ticketTypes.length > 0) {
          await tx.eventTicketType.createMany({
            data: ticketTypes.map(ticketType => ({
              name: ticketType.name,
              price: ticketType.price,
              quantity: ticketType.quantity,
              availableQuantity: ticketType.quantity, // FIX: Initialize available quantity
              description: ticketType.description,
              eventId: event.id,
            })),
          });
        }

        return event;

      } catch (error) {
        // FIX: Rollback Cloudinary upload jika database operation gagal
        if (cloudinaryPublicId) {
          try {
            await deleteFromCloudinary(cloudinaryPublicId);
            console.log('Rollback: Deleted uploaded image from Cloudinary');
          } catch (rollbackError) {
            console.error('Failed to rollback Cloudinary upload:', rollbackError);
          }
        }
        throw error;
      }
    });
  }

  // FIX: Update event dengan validasi dan image management
  async updateEvent(
    id: string, 
    organizerId: string, 
    updateData: Partial<Event>,
    imageFile?: Express.Multer.File
  ) {
    // FIX: Validasi event exists dan belongs to organizer
    const existingEvent = await prisma.event.findFirst({
      where: { 
        id, 
        organizerId,
        isDeleted: false 
      },
      select: { imagePublicId: true }
    });

    if (!existingEvent) {
      throw new Error('Event not found or access denied');
    }

    let newImagePublicId: string | undefined;
    let oldImagePublicId = existingEvent.imagePublicId;

    return await prisma.$transaction(async (tx) => {
      try {
        // FIX: Upload new image jika provided
        if (imageFile) {
          try {
            console.log('Uploading updated event image to Cloudinary...');
            const uploadResult = await uploadToCloudinary(imageFile);
            updateData.imageUrl = uploadResult.secure_url;
            newImagePublicId = uploadResult.public_id;
            (updateData as any).imagePublicId = newImagePublicId; // FIX: Type assertion
            console.log('Event image updated:', uploadResult.secure_url);
          } catch (error) {
            console.error('Failed to upload event image:', error);
            throw new Error('Failed to upload event image');
          }
        }

        // FIX: Check duplicate title (exclude current event)
        if (updateData.title) {
          const duplicateEvent = await tx.event.findFirst({
            where: {
              title: { 
                contains: updateData.title, 
                mode: 'insensitive' 
              },
              organizerId,
              id: { not: id },
              isDeleted: false
            }
          });

          if (duplicateEvent) {
            throw new Error('Another event with this title already exists');
          }
        }

        const updatedEvent = await tx.event.update({
          where: { id, organizerId },
          data: updateData,
        });

        // FIX: Delete old image dari Cloudinary jika upload baru berhasil
        if (newImagePublicId && oldImagePublicId) {
          try {
            await deleteFromCloudinary(oldImagePublicId);
            console.log('Deleted old event image from Cloudinary');
          } catch (deleteError) {
            console.error('Failed to delete old image:', deleteError);
            // Continue - jangan throw error karena update sudah berhasil
          }
        }

        return updatedEvent;

      } catch (error) {
        // FIX: Rollback new image upload jika database operation gagal
        if (newImagePublicId) {
          try {
            await deleteFromCloudinary(newImagePublicId);
            console.log('Rollback: Deleted new image from Cloudinary');
          } catch (rollbackError) {
            console.error('Failed to rollback Cloudinary upload:', rollbackError);
          }
        }
        throw error;
      }
    });
  }

  async getOrganizerEvents(organizerId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where: { 
          organizerId,
          isDeleted: false // FIX: Exclude deleted events
        },
        include: {
          ticketTypes: true,
          _count: {
            select: {
              transactions: true,
              attendees: true,
              reviews: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.event.count({ 
        where: { 
          organizerId,
          isDeleted: false 
        } 
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  // FIX: Event analytics dengan revenue calculation yang aman
  async getEventAnalytics(eventId: string, organizerId: string) {
    const event = await prisma.event.findFirst({
      where: { 
        id: eventId, 
        organizerId,
        isDeleted: false 
      },
      include: {
        ticketTypes: {
          include: {
            _count: {
              select: {
                transactionItems: {
                  where: {
                    transaction: {
                      status: {
                        in: ['DONE', 'SUCCESS', 'CONFIRMED'] as TransactionStatus[]
                      }
                    }
                  }
                },
              },
            },
          },
        },
        transactions: {
          where: {
            status: { in: ['DONE', 'SUCCESS', 'CONFIRMED'] as TransactionStatus[] },
          },
          include: {
            items: true,
          },
        },
        attendees: {
          where: {
            transaction: {
              status: { in: ['DONE', 'SUCCESS', 'CONFIRMED'] as TransactionStatus[] }
            }
          }
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // FIX: Revenue calculation yang aman - handle null/undefined
    const successfulTransactions = event.transactions || [];
    const totalRevenue = successfulTransactions.reduce(
      (sum, transaction) => sum + (transaction.finalAmount || 0),
      0
    );

    const averageRating =
      event.reviews.length > 0
        ? event.reviews.reduce((sum, review) => sum + review.rating, 0) / event.reviews.length
        : 0;

    // FIX: Handle _count yang mungkin undefined
    const ticketSales = event.ticketTypes.map(ticketType => ({
      name: ticketType.name,
      sold: ticketType._count?.transactionItems || 0,
      total: ticketType.quantity,
      revenue: (ticketType._count?.transactionItems || 0) * (ticketType.price || 0),
    }));

    return {
      event: {
        id: event.id,
        title: event.title,
        bookedSeats: event.bookedSeats || 0,
        availableSeats: event.availableSeats || 0,
        soldQuantity: event.soldQuantity || 0,
      },
      analytics: {
        totalRevenue,
        averageRating: Math.round(averageRating * 10) / 10,
        totalTransactions: successfulTransactions.length,
        totalAttendees: event.attendees.length,
        totalReviews: event.reviews.length,
        ticketSales,
        occupancyRate: event.availableSeats > 0 
          ? Math.round(((event.bookedSeats || 0) / event.availableSeats) * 100) 
          : 0,
      },
    };
  }

  // FIX: Update event image dengan rollback mechanism
  async updateEventImage(eventId: string, organizerId: string, imageFile: Express.Multer.File) {
    // Verify event belongs to organizer
    const event = await prisma.event.findFirst({
      where: { 
        id: eventId, 
        organizerId,
        isDeleted: false 
      },
    });

    if (!event) {
      throw new Error('Event not found or access denied');
    }

    let newImagePublicId: string | undefined;
    const oldImagePublicId = event.imagePublicId;

    return await prisma.$transaction(async (tx) => {
      try {
        // Upload new image
        const uploadResult = await uploadToCloudinary(imageFile);
        const imageUrl = uploadResult.secure_url;
        newImagePublicId = uploadResult.public_id;

        // Update event with new image
        const updatedEvent = await tx.event.update({
          where: { id: eventId },
          data: { 
            imageUrl,
            imagePublicId: newImagePublicId 
          },
        });

        // Delete old image dari Cloudinary
        if (oldImagePublicId) {
          try {
            await deleteFromCloudinary(oldImagePublicId);
            console.log('Deleted old event image from Cloudinary');
          } catch (deleteError) {
            console.error('Failed to delete old image:', deleteError);
            // Continue - jangan throw error
          }
        }

        return updatedEvent;

      } catch (error) {
        // Rollback new image upload jika gagal
        if (newImagePublicId) {
          try {
            await deleteFromCloudinary(newImagePublicId);
          } catch (rollbackError) {
            console.error('Failed to rollback Cloudinary upload:', rollbackError);
          }
        }
        throw error;
      }
    });
  }

  // FIX: Soft delete event
  async deleteEvent(eventId: string, organizerId: string): Promise<void> {
    const event = await prisma.event.findFirst({
      where: { 
        id: eventId, 
        organizerId,
        isDeleted: false 
      },
      include: {
        transactions: {
          where: {
            status: { in: ['DONE', 'SUCCESS', 'CONFIRMED'] as TransactionStatus[] }
          }
        }
      }
    });

    if (!event) {
      throw new Error('Event not found or access denied');
    }

    // FIX: Cek jika ada transaksi yang sukses
    if (event.transactions.length > 0) {
      throw new Error('Cannot delete event with successful transactions');
    }

    await prisma.$transaction(async (tx) => {
      // Soft delete event
      await tx.event.update({
        where: { id: eventId },
        data: { 
          isDeleted: true,
          deletedAt: new Date()
        }
      });

      // FIX: Delete image dari Cloudinary
      if (event.imagePublicId) {
        try {
          await deleteFromCloudinary(event.imagePublicId);
          console.log('Deleted event image from Cloudinary');
        } catch (error) {
          console.error('Failed to delete event image from Cloudinary:', error);
          // Continue - jangan throw error karena soft delete sudah berhasil
        }
      }
    });
  }

  // FIX: Get events statistics untuk dashboard
  async getOrganizerEventsStats(organizerId: string) {
    const now = new Date();
    
    const [totalEvents, publishedEvents, upcomingEvents, totalRevenue] = await Promise.all([
      // Total events
      prisma.event.count({
        where: {
          organizerId,
          isDeleted: false
        }
      }),
      
      // Published events
      prisma.event.count({
        where: {
          organizerId,
          isPublished: true,
          isDeleted: false
        }
      }),
      
      // Upcoming events
      prisma.event.count({
        where: {
          organizerId,
          startDate: { gt: now },
          isDeleted: false
        }
      }),
      
      // Total revenue
      prisma.transaction.aggregate({
        where: {
          event: {
            organizerId,
            isDeleted: false
          },
          status: { in: ['DONE', 'SUCCESS', 'CONFIRMED'] as TransactionStatus[] }
        },
        _sum: {
          finalAmount: true
        }
      })
    ]);

    return {
      totalEvents,
      publishedEvents,
      upcomingEvents,
      totalRevenue: totalRevenue._sum?.finalAmount || 0,
      draftEvents: totalEvents - publishedEvents
    };
  }

  // FIX: Search events dengan advanced filtering
  async searchEvents(query: string, filters: {
    category?: string;
    location?: string;
    dateRange?: { start: Date; end: Date };
    priceRange?: { min: number; max: number };
  } = {}) {
    const where: Prisma.EventWhereInput = {
      isPublished: true,
      isDeleted: false,
      AND: [
        {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } },
            { location: { contains: query, mode: 'insensitive' } },
          ]
        }
      ]
    };

    // Apply additional filters
    if (filters.category) {
      (where.AND as Prisma.EventWhereInput[]).push({
        category: { contains: filters.category, mode: 'insensitive' }
      });
    }

    if (filters.location) {
      (where.AND as Prisma.EventWhereInput[]).push({
        location: { contains: filters.location, mode: 'insensitive' }
      });
    }

    if (filters.dateRange) {
      (where.AND as Prisma.EventWhereInput[]).push({
        OR: [
          {
            startDate: { gte: filters.dateRange.start },
            endDate: { lte: filters.dateRange.end }
          },
          {
            startDate: { lte: filters.dateRange.end },
            endDate: { gte: filters.dateRange.start }
          }
        ]
      });
    }

    if (filters.priceRange) {
      (where.AND as Prisma.EventWhereInput[]).push({
        basePrice: {
          gte: filters.priceRange.min,
          lte: filters.priceRange.max
        }
      });
    }

    return prisma.event.findMany({
      where,
      include: {
        organizer: {
          select: {
            id: true,
            fullName: true,
            profilePicture: true,
          },
        },
        ticketTypes: {
          orderBy: { price: 'asc' },
          take: 1 // Get cheapest ticket for display
        },
        _count: {
          select: {
            reviews: true,
            attendees: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc'
      },
      take: 50 // Limit results
    });
  }

  // FIX: Validasi event data
  private validateEventData(eventData: {
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    availableSeats: number;
    basePrice: number;
  }) {
    if (!eventData.title || eventData.title.trim().length < 3) {
      throw new Error('Event title must be at least 3 characters long');
    }

    if (eventData.startDate >= eventData.endDate) {
      throw new Error('Event end date must be after start date');
    }

    if (eventData.availableSeats <= 0) {
      throw new Error('Available seats must be greater than 0');
    }

    if (eventData.basePrice < 0) {
      throw new Error('Base price cannot be negative');
    }

    // FIX: Validasi dates tidak di masa lalu
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset time to beginning of day
    
    const startDate = new Date(eventData.startDate);
    startDate.setHours(0, 0, 0, 0);
    
    if (startDate < now) {
      throw new Error('Event start date cannot be in the past');
    }
  }

  // FIX: Method untuk calculate revenue yang aman
  async calculateEventRevenue(eventId: string): Promise<number> {
    const revenue = await prisma.transaction.aggregate({
      where: {
        eventId,
        status: { in: ['DONE', 'SUCCESS', 'CONFIRMED'] as TransactionStatus[] },
        finalAmount: { not: null }
      },
      _sum: {
        finalAmount: true
      }
    });

    return revenue._sum?.finalAmount || 0;
  }

  // FIX: Update event seats setelah transaction
  async updateEventSeats(eventId: string, quantity: number, operation: 'increment' | 'decrement') {
    return await prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({
        where: { id: eventId },
        select: { availableSeats: true, bookedSeats: true },
        // lock: { mode: 'update' } // FIX: Lock untuk prevent race condition
      });

      if (!event) {
        throw new Error('Event not found');
      }

      if (operation === 'decrement' && event.availableSeats < quantity) {
        throw new Error('Not enough seats available');
      }

      const updateData = {
        availableSeats: operation === 'increment' 
          ? { increment: quantity } 
          : { decrement: quantity },
        bookedSeats: operation === 'increment'
          ? { decrement: quantity }
          : { increment: quantity },
        soldQuantity: operation === 'increment'
          ? { decrement: quantity }
          : { increment: quantity }
      };

      return tx.event.update({
        where: { id: eventId },
        data: updateData
      });
    });
  }
}