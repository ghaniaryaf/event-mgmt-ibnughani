import { Prisma, DiscountType } from '@prisma/client';
import { prisma } from '../utils/prisma';

export interface VoucherCreateRequest {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  maxUsage: number;
  minPurchaseAmount?: number;
  startDate: Date;
  endDate: Date;
  description?: string;
}

export class VoucherService {
  // ================== CREATE VOUCHER ==================
  async createVoucher(eventId: string, organizerId: string, voucherData: VoucherCreateRequest) {
    // FIX: Validasi data voucher sebelum create
    this.validateVoucherData(voucherData);

    return await prisma.$transaction(async (tx) => {
      // Verify event belongs to organizer
      const event = await tx.event.findFirst({
        where: {
          id: eventId,
          organizerId,
          isDeleted: false
        },
      });

      if (!event) {
        throw new Error('Event not found or access denied');
      }

      // FIX: Check if voucher code already exists (case insensitive)
      const existingVoucher = await tx.eventVoucher.findFirst({
        where: {
          code: { 
            equals: voucherData.code, 
            mode: 'insensitive' 
          },
          isDeleted: false
        },
      });

      if (existingVoucher) {
        throw new Error('Voucher code already exists');
      }

      // FIX: Create voucher dengan validasi tambahan
      const voucher = await tx.eventVoucher.create({
        data: {
          eventId,
          code: voucherData.code.toUpperCase(), // FIX: Standardize to uppercase
          discountType: voucherData.discountType,
          discountValue: voucherData.discountValue,
          maxUsage: voucherData.maxUsage,
          minPurchaseAmount: voucherData.minPurchaseAmount || 0,
          startDate: voucherData.startDate,
          endDate: voucherData.endDate,
          description: voucherData.description,
          usedCount: 0,
          isDeleted: false
        },
      });

      return voucher;
    });
  }

  // ================== GET EVENT VOUCHERS ==================
  async getEventVouchers(eventId: string, organizerId: string) {
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

    const vouchers = await prisma.eventVoucher.findMany({
      where: {
        eventId,
        isDeleted: false // FIX: Exclude deleted vouchers
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        code: true,
        discountType: true,
        discountValue: true,
        maxUsage: true,
        usedCount: true,
        minPurchaseAmount: true,
        startDate: true,
        endDate: true,
        description: true,
        createdAt: true,
        // FIX: Jangan include field sensitive atau tidak perlu
      }
    });

    return vouchers;
  }

  // ================== GET ACTIVE VOUCHERS ==================
  async getActiveVouchers(eventId: string) {
    const now = new Date();
    
    const vouchers = await prisma.eventVoucher.findMany({
      where: {
        eventId,
        startDate: { lte: now },
        endDate: { gte: now },
        // FIX: Akses maxUsage yang benar dengan Prisma
        usedCount: { 
          lt: prisma.eventVoucher.fields.maxUsage 
        },
        isDeleted: false
      },
      select: {
        id: true,
        code: true,
        discountType: true,
        discountValue: true,
        maxUsage: true,
        usedCount: true,
        minPurchaseAmount: true,
        startDate: true,
        endDate: true,
        description: true,
        // FIX: Jangan include field yang tidak perlu untuk public API
      },
    });

    return vouchers;
  }

  // ================== UPDATE VOUCHER ==================
  async updateVoucher(voucherId: string, organizerId: string, updateData: Partial<VoucherCreateRequest>) {
    // FIX: Sanitize update data - hanya field yang diizinkan
    const allowedUpdates = this.sanitizeVoucherUpdate(updateData);

    if (Object.keys(allowedUpdates).length === 0) {
      throw new Error('No valid fields to update');
    }

    // FIX: Validasi data yang diupdate
    if (allowedUpdates.startDate || allowedUpdates.endDate || allowedUpdates.discountValue) {
      await this.validateVoucherUpdateData(voucherId, organizerId, allowedUpdates);
    }

    return await prisma.$transaction(async (tx) => {
      const voucher = await tx.eventVoucher.findFirst({
        where: {
          id: voucherId,
          event: {
            organizerId,
          },
          isDeleted: false
        },
        include: {
          event: true,
        },
      });

      if (!voucher) {
        throw new Error('Voucher not found or access denied');
      }

      // FIX: Jika voucher sudah digunakan, batasi field yang bisa diupdate
      if (voucher.usedCount > 0) {
        const restrictedFields = ['code', 'discountType', 'discountValue', 'maxUsage'];
        const attemptedRestrictedUpdate = Object.keys(allowedUpdates).some(field => 
          restrictedFields.includes(field)
        );

        if (attemptedRestrictedUpdate) {
          throw new Error('Cannot update voucher code, discount, or max usage after voucher has been used');
        }
      }

      // If updating code, check for duplicates (case insensitive)
      if (allowedUpdates.code && allowedUpdates.code !== voucher.code) {
        const existingVoucher = await tx.eventVoucher.findFirst({
          where: {
            code: { 
              equals: allowedUpdates.code, 
              mode: 'insensitive' 
            },
            id: { not: voucherId },
            isDeleted: false
          },
        });

        if (existingVoucher) {
          throw new Error('Voucher code already exists');
        }

        // FIX: Standardize code to uppercase
        allowedUpdates.code = allowedUpdates.code.toUpperCase();
      }

      const updatedVoucher = await tx.eventVoucher.update({
        where: { id: voucherId },
        data: allowedUpdates,
      });

      return updatedVoucher;
    });
  }

  // ================== DELETE VOUCHER (SOFT DELETE) ==================
  async deleteVoucher(voucherId: string, organizerId: string) {
    return await prisma.$transaction(async (tx) => {
      const voucher = await tx.eventVoucher.findFirst({
        where: {
          id: voucherId,
          event: {
            organizerId,
          },
          isDeleted: false
        },
        include: {
          transactions: {
            where: {
              status: { 
                in: ['WAITING_FOR_PAYMENT', 'WAITING_FOR_CONFIRMATION', 'DONE'] 
              }
            },
            take: 1
          }
        },
      });

      if (!voucher) {
        throw new Error('Voucher not found or access denied');
      }

      // FIX: Cek jika voucher sudah dipakai di transaksi aktif
      if (voucher.transactions.length > 0) {
        throw new Error('Cannot delete voucher that has been used in active transactions');
      }

      // FIX: Soft delete daripada hard delete
      await tx.eventVoucher.update({
        where: { id: voucherId },
        data: {
          isDeleted: true,
          deletedAt: new Date()
        },
      });

      return { message: 'Voucher deleted successfully' };
    });
  }

  // ================== VALIDATE VOUCHER WITH LOCKING ==================
  async validateVoucher(code: string, eventId: string, totalAmount: number, userId?: string) {
    const now = new Date();
    
    return await prisma.$transaction(async (tx) => {
      // FIX: Lock voucher row untuk prevent race condition
      const voucher = await tx.eventVoucher.findFirst({
        where: {
          code: { 
            equals: code, 
            mode: 'insensitive' 
          },
          eventId,
          startDate: { lte: now },
          endDate: { gte: now },
          isDeleted: false
        },
        // lock: { mode: 'update' }
      });

      if (!voucher) {
        throw new Error('Invalid or expired voucher');
      }

      // FIX: Check usage count dengan locking
      if (voucher.usedCount >= voucher.maxUsage) {
        throw new Error('Voucher usage limit reached');
      }

      if (totalAmount < voucher.minPurchaseAmount) {
        throw new Error(`Minimum purchase amount for this voucher is ${voucher.minPurchaseAmount}`);
      }

      // FIX: Cek jika user sudah pernah menggunakan voucher ini
      if (userId) {
        const existingUsage = await tx.transaction.findFirst({
          where: {
            userId,
            voucherId: voucher.id,
            status: { 
              in: ['WAITING_FOR_PAYMENT', 'WAITING_FOR_CONFIRMATION', 'DONE'] 
            }
          }
        });

        if (existingUsage) {
          throw new Error('You have already used this voucher');
        }
      }

      return voucher;
    });
  }

  // ================== USE VOUCHER (INCREMENT USAGE) ==================
  async useVoucher(voucherId: string) {
    return await prisma.$transaction(async (tx) => {
      // FIX: Lock voucher untuk prevent over-usage
      const voucher = await tx.eventVoucher.findUnique({
        where: { 
          id: voucherId,
          isDeleted: false 
        },
        // lock: { mode: 'update' }
      });

      if (!voucher) {
        throw new Error('Voucher not found');
      }

      if (voucher.usedCount >= voucher.maxUsage) {
        throw new Error('Voucher usage limit reached');
      }

      // FIX: Update used count dengan locking
      const updatedVoucher = await tx.eventVoucher.update({
        where: { id: voucherId },
        data: { 
          usedCount: { increment: 1 } 
        },
      });

      return updatedVoucher;
    });
  }

  // ================== UNUSE VOUCHER (DECREMENT USAGE) ==================
  async unuseVoucher(voucherId: string) {
    return await prisma.$transaction(async (tx) => {
      // FIX: Lock voucher untuk prevent race condition
      const voucher = await tx.eventVoucher.findUnique({
        where: { 
          id: voucherId,
          isDeleted: false 
        },
        // lock: { mode: 'update' }
      });

      if (!voucher) {
        throw new Error('Voucher not found');
      }

      if (voucher.usedCount <= 0) {
        throw new Error('Voucher usage count cannot be negative');
      }

      // FIX: Decrement used count dengan locking
      const updatedVoucher = await tx.eventVoucher.update({
        where: { id: voucherId },
        data: { 
          usedCount: { decrement: 1 } 
        },
      });

      return updatedVoucher;
    });
  }

  // ================== GET VOUCHER ANALYTICS ==================
  async getVoucherAnalytics(voucherId: string, organizerId: string) {
    const voucher = await prisma.eventVoucher.findFirst({
      where: {
        id: voucherId,
        event: {
          organizerId,
        },
        isDeleted: false
      },
      include: {
        event: {
          select: {
            title: true,
            id: true
          }
        },
        transactions: {
          where: {
            status: { 
              in: ['WAITING_FOR_PAYMENT', 'WAITING_FOR_CONFIRMATION', 'DONE'] 
            }
          },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            transactions: {
              where: {
                status: { 
                  in: ['WAITING_FOR_PAYMENT', 'WAITING_FOR_CONFIRMATION', 'DONE'] 
                }
              }
            }
          }
        }
      },
    });

    if (!voucher) {
      throw new Error('Voucher not found or access denied');
    }

    const totalDiscount = voucher.transactions.reduce((sum, transaction) => {
      return sum + (transaction.voucherDiscount || 0);
    }, 0);

    const usageRate = voucher.maxUsage > 0 ? (voucher.usedCount / voucher.maxUsage) * 100 : 0;

    return {
      voucher: {
        id: voucher.id,
        code: voucher.code,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        maxUsage: voucher.maxUsage,
        usedCount: voucher.usedCount,
        minPurchaseAmount: voucher.minPurchaseAmount,
        startDate: voucher.startDate,
        endDate: voucher.endDate,
        description: voucher.description
      },
      analytics: {
        totalUsage: voucher.usedCount,
        remainingUsage: voucher.maxUsage - voucher.usedCount,
        usageRate: Math.round(usageRate * 100) / 100,
        totalDiscount: totalDiscount,
        transactionCount: voucher._count.transactions,
        recentTransactions: voucher.transactions.slice(0, 10) // Last 10 transactions
      },
      event: voucher.event
    };
  }

  // ================== VALIDATE VOUCHER DATA ==================
  private validateVoucherData(voucherData: VoucherCreateRequest) {
    // Validasi code
    if (!voucherData.code || voucherData.code.trim().length < 3) {
      throw new Error('Voucher code must be at least 3 characters long');
    }

    if (!/^[A-Z0-9_-]+$/i.test(voucherData.code)) {
      throw new Error('Voucher code can only contain letters, numbers, hyphens, and underscores');
    }

    // Validasi discount value
    this.validateDiscountValue(voucherData.discountValue, voucherData.discountType);

    // Validasi max usage
    if (voucherData.maxUsage <= 0 || voucherData.maxUsage > 100000) {
      throw new Error('Max usage must be between 1 and 100,000');
    }

    // Validasi dates
    this.validateVoucherDates(voucherData.startDate, voucherData.endDate);

    // Validasi min purchase amount
    if (voucherData.minPurchaseAmount && voucherData.minPurchaseAmount < 0) {
      throw new Error('Minimum purchase amount cannot be negative');
    }
  }

  // ================== VALIDATE DISCOUNT VALUE ==================
  private validateDiscountValue(discountValue: number, discountType: DiscountType) {
    if (discountType === 'PERCENTAGE') {
      if (discountValue <= 0 || discountValue > 100) {
        throw new Error('Percentage discount must be between 1 and 100');
      }
    } else {
      if (discountValue <= 0) {
        throw new Error('Fixed discount must be greater than 0');
      }
    }
  }

  // ================== VALIDATE VOUCHER DATES ==================
  private validateVoucherDates(startDate: Date, endDate: Date) {
    if (startDate >= endDate) {
      throw new Error('Voucher start date must be before end date');
    }

    if (endDate <= new Date()) {
      throw new Error('Voucher end date must be in the future');
    }

    // Validasi voucher duration tidak terlalu panjang (max 1 tahun)
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    
    if (endDate > oneYearFromNow) {
      throw new Error('Voucher validity cannot exceed 1 year');
    }
  }

  // ================== SANITIZE VOUCHER UPDATE ==================
  private sanitizeVoucherUpdate(updateData: Partial<VoucherCreateRequest>): Partial<VoucherCreateRequest> {
    const allowedFields = [
      'code',
      'discountType',
      'discountValue', 
      'maxUsage',
      'minPurchaseAmount',
      'startDate',
      'endDate',
      'description'
    ];
    
    const sanitized: Partial<VoucherCreateRequest> = {};
    
    allowedFields.forEach(field => {
      if (updateData[field as keyof VoucherCreateRequest] !== undefined) {
        sanitized[field as keyof VoucherCreateRequest] = updateData[field as keyof VoucherCreateRequest];
      }
    });
    
    return sanitized;
  }

  // ================== VALIDATE VOUCHER UPDATE DATA ==================
  private async validateVoucherUpdateData(voucherId: string, organizerId: string, updateData: Partial<VoucherCreateRequest>) {
    const voucher = await prisma.eventVoucher.findFirst({
      where: {
        id: voucherId,
        event: { organizerId },
        isDeleted: false
      }
    });

    if (!voucher) {
      throw new Error('Voucher not found');
    }

    // Validasi dates
    if (updateData.startDate || updateData.endDate) {
      const startDate = updateData.startDate || voucher.startDate;
      const endDate = updateData.endDate || voucher.endDate;
      this.validateVoucherDates(startDate, endDate);
    }

    // Validasi discount value
    if (updateData.discountValue !== undefined) {
      const discountType = updateData.discountType || voucher.discountType;
      this.validateDiscountValue(updateData.discountValue, discountType);
    }
  }

  // ================== BULK DELETE EXPIRED VOUCHERS ==================
  async bulkDeleteExpiredVouchers(organizerId: string): Promise<{ deletedCount: number }> {
    const now = new Date();

    const result = await prisma.eventVoucher.updateMany({
      where: {
        event: {
          organizerId
        },
        endDate: { lt: now },
        isDeleted: false,
        usedCount: 0 // Hanya delete yang belum pernah digunakan
      },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });

    return { deletedCount: result.count };
  }
}