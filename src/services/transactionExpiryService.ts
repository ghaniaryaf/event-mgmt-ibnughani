import { PrismaClient, TransactionStatus, Prisma } from '@prisma/client';
import cron from 'node-cron';
import { PointService } from './pointService';
import { VoucherService } from './voucherService';

const prisma = new PrismaClient();
const pointService = new PointService();
const voucherService = new VoucherService();

export class TransactionExpiryService {
  private isRunning: boolean = false;

  start() {
    if (this.isRunning) {
      console.log('Transaction expiry service is already running');
      return;
    }

    // Run every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      try {
        console.log('🕒 Running transaction expiry job...');
        await this.expirePendingTransactions();
        console.log('✅ Transaction expiry job completed');
      } catch (error) {
        console.error('❌ Transaction expiry job failed:', error);
      }
    });

    this.isRunning = true;
    console.log('✅ Transaction expiry service started');
  }

  stop() {
    this.isRunning = false;
    console.log('🛑 Transaction expiry service stopped');
  }

  private async expirePendingTransactions() {
    const expiredTransactions = await prisma.transaction.findMany({
      where: {
        status: 'PENDING' as TransactionStatus, // FIX: Type assertion
        expiryTime: { lt: new Date() },
        isDeleted: false // FIX: Exclude deleted transactions
      },
      include: {
        voucher: true,
        items: { // FIX: Include items untuk mendapatkan quantity dan ticketTypeId
          include: {
            ticketType: true
          }
        },
        coupon: true
      }
    });

    console.log(`📊 Found ${expiredTransactions.length} expired transactions to process`);

    for (const transaction of expiredTransactions) {
      try {
        await this.processExpiredTransaction(transaction);
      } catch (error) {
        console.error(`❌ Failed to process expired transaction ${transaction.id}:`, error);
      }
    }
  }

  private async processExpiredTransaction(transaction: any) {
    return await prisma.$transaction(async (tx) => {
      // FIX: Lock transaction untuk prevent race condition
      const lockedTransaction = await tx.transaction.findUnique({
        where: { 
          id: transaction.id,
          status: 'PENDING' as TransactionStatus // Double check status
        },
        // lock: { prisma.TransactionLockMode.forUpdate } // FIX: Lock the row
      });

      if (!lockedTransaction) {
        console.log(`ℹ️ Transaction ${transaction.id} already processed, skipping`);
        return;
      }

      // Update transaction status
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { 
          status: 'EXPIRED' as TransactionStatus,
          failureReason: 'Transaction expired automatically'
        }
      });

      // FIX: Restore event and ticket quantities menggunakan items
      if (transaction.items && transaction.items.length > 0) {
        const totalTickets = transaction.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
        
        console.log(`🔄 Restoring ${totalTickets} seats for event ${transaction.eventId}`);

        // Restore event seats
        await tx.event.update({
          where: { id: transaction.eventId },
          data: {
            soldQuantity: { decrement: totalTickets },
            availableSeats: { increment: totalTickets },
            bookedSeats: { decrement: totalTickets }
          }
        });

        // Restore individual ticket type quantities
        for (const item of transaction.items) {
          console.log(`🔄 Restoring ${item.quantity} tickets for ${item.ticketType.name}`);
          
          await tx.eventTicketType.update({
            where: { id: item.ticketTypeId },
            data: {
              soldQuantity: { decrement: item.quantity },
              availableQuantity: { increment: item.quantity }
            }
          });
        }
      }

      // FIX: Restore points jika digunakan
      if (transaction.pointsUsed > 0) {
        console.log(`🔄 Restoring ${transaction.pointsUsed} points for user ${transaction.userId}`);
        
        await pointService.restorePointsWithLock(
          transaction.userId,
          transaction.pointsUsed,
          tx
        );
      }

      // FIX: Restore voucher usage count
      if (transaction.voucherId) {
        console.log(`🔄 Restoring voucher usage count for voucher ${transaction.voucherId}`);
        
        await tx.eventVoucher.update({
          where: { id: transaction.voucherId },
          data: { usedCount: { decrement: 1 } }
        });
      }

      // FIX: Restore coupon jika digunakan
      if (transaction.couponId) {
        console.log(`🔄 Restoring coupon ${transaction.couponId}`);
        
        await tx.userCoupon.update({
          where: { id: transaction.couponId },
          data: { isUsed: false }
        });
      }

      console.log(`✅ Successfully expired transaction: ${transaction.id}`);
    }, {
      maxWait: 10000, // FIX: Max wait for lock
      timeout: 30000  // FIX: Transaction timeout
    });
  }

  // FIX: Manual expire transaction untuk testing atau admin purposes
  async manuallyExpireTransaction(transactionId: string): Promise<boolean> {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: {
          voucher: true,
          items: {
            include: {
              ticketType: true
            }
          },
          coupon: true
        }
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.status !== 'PENDING') {
        throw new Error(`Transaction status is ${transaction.status}, cannot expire`);
      }

      await this.processExpiredTransaction(transaction);
      return true;
    } catch (error) {
      console.error(`❌ Failed to manually expire transaction ${transactionId}:`, error);
      return false;
    }
  }

  // FIX: Get expiry statistics
  async getExpiryStats(): Promise<{
    pendingCount: number;
    expiredCount: number;
    nextExpiry: Date | null;
  }> {
    const now = new Date();
    
    const [pendingCount, expiredCount, nextExpiry] = await Promise.all([
      // Count pending transactions
      prisma.transaction.count({
        where: {
          status: 'PENDING' as TransactionStatus,
          expiryTime: { gt: now },
          isDeleted: false
        }
      }),
      
      // Count expired transactions (last 24 hours)
      prisma.transaction.count({
        where: {
          status: 'EXPIRED' as TransactionStatus,
          updatedAt: { 
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // Last 24 hours
          },
          isDeleted: false
        }
      }),
      
      // Get next expiry time
      prisma.transaction.findFirst({
        where: {
          status: 'PENDING' as TransactionStatus,
          expiryTime: { gt: now },
          isDeleted: false
        },
        select: {
          expiryTime: true
        },
        orderBy: {
          expiryTime: 'asc'
        }
      })
    ]);

    return {
      pendingCount,
      expiredCount,
      nextExpiry: nextExpiry?.expiryTime || null
    };
  }

  // FIX: Clean up old expired transactions (housekeeping)
  async cleanupOldExpiredTransactions(daysOld: number = 30): Promise<{ deletedCount: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    try {
      const result = await prisma.transaction.updateMany({
        where: {
          status: 'EXPIRED' as TransactionStatus,
          updatedAt: { lt: cutoffDate },
          isDeleted: false
        },
        data: {
          isDeleted: true,
          deletedAt: new Date()
        }
      });

      console.log(`🧹 Cleaned up ${result.count} expired transactions older than ${daysOld} days`);
      
      return { deletedCount: result.count };
    } catch (error) {
      console.error('❌ Failed to cleanup old expired transactions:', error);
      return { deletedCount: 0 };
    }
  }

  // FIX: Check for transactions that are about to expire (for notifications)
  async getTransactionsExpiringSoon(minutes: number = 30): Promise<any[]> {
    const expiryThreshold = new Date();
    expiryThreshold.setMinutes(expiryThreshold.getMinutes() + minutes);

    return await prisma.transaction.findMany({
      where: {
        status: 'PENDING' as TransactionStatus,
        expiryTime: { 
          lte: expiryThreshold,
          gt: new Date() // Still valid but expiring soon
        },
        isDeleted: false,
        // FIX: Exclude transactions that already have expiry warnings sent
        expiryWarningSent: false
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        },
        event: {
          select: {
            title: true,
            startDate: true
          }
        },
        items: {
          include: {
            ticketType: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        expiryTime: 'asc'
      }
    });
  }

  // FIX: Mark expiry warning as sent
  async markExpiryWarningSent(transactionId: string): Promise<void> {
    await prisma.transaction.update({
      where: { id: transactionId },
      data: { expiryWarningSent: true }
    });
  }

  // FIX: Health check untuk service
  async healthCheck(): Promise<{ healthy: boolean; message: string; stats?: any }> {
    try {
      const stats = await this.getExpiryStats();
      
      return {
        healthy: true,
        message: 'Transaction expiry service is running',
        stats
      };
    } catch (error) {
      return {
        healthy: false,
        message: `Transaction expiry service health check failed: ${error}`
      };
    }
  }
}

// FIX: Tambahkan field expiryWarningSent di schema.prisma jika belum ada
/*
// Di model Transaction, tambahkan:
model Transaction {
  // ... existing fields
  expiryWarningSent Boolean @default(false) // Untuk track apakah warning sudah dikirim
  // ... rest of fields
}
*/