/*
  Warnings:

  - You are about to drop the `OtpCode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('CUSTOMER', 'ORGANIZER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."TransactionStatus" AS ENUM ('WAITING_FOR_PAYMENT', 'WAITING_FOR_CONFIRMATION', 'DONE', 'REJECTED', 'EXPIRED', 'CANCELED');

-- CreateEnum
CREATE TYPE "public"."DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- DropForeignKey
ALTER TABLE "public"."OtpCode" DROP CONSTRAINT "OtpCode_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Post" DROP CONSTRAINT "Post_profileId_fkey";

-- DropTable
DROP TABLE "public"."OtpCode";

-- DropTable
DROP TABLE "public"."Post";

-- DropTable
DROP TABLE "public"."Profile";

-- DropEnum
DROP TYPE "public"."Role";

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "profilePicture" TEXT,
    "phoneNumber" TEXT,
    "address" TEXT,
    "referralCode" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."events" (
    "id" TEXT NOT NULL,
    "organizerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "imageUrl" TEXT,
    "availableSeats" INTEGER NOT NULL,
    "bookedSeats" INTEGER NOT NULL DEFAULT 0,
    "basePrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."event_ticket_types" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "soldQuantity" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_ticket_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."event_vouchers" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discountType" "public"."DiscountType" NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "maxUsage" INTEGER NOT NULL,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "minPurchaseAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "status" "public"."TransactionStatus" NOT NULL DEFAULT 'WAITING_FOR_PAYMENT',
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "pointsUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "voucherId" TEXT,
    "voucherDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "couponId" TEXT,
    "couponDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "finalAmount" DOUBLE PRECISION NOT NULL,
    "expiryTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transaction_items" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "ticketTypeId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "pricePerTicket" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaction_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transaction_payments" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "paymentProofUrl" TEXT NOT NULL,
    "paymentMethod" TEXT,
    "accountNumber" TEXT,
    "accountName" TEXT,
    "paymentDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reviews" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."referrals" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "refereeId" TEXT NOT NULL,
    "codeUsed" TEXT NOT NULL,
    "isRewardClaimed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_points" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "isExpired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."coupon_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "discountType" "public"."DiscountType" NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "minPurchaseAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxDiscountAmount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupon_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_coupons" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "couponTemplateId" TEXT NOT NULL,
    "referralId" TEXT,
    "code" TEXT NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "relatedId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."event_attendees" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "ticketCount" INTEGER NOT NULL,
    "totalPaid" DOUBLE PRECISION NOT NULL,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "attendedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_attendees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_referralCode_key" ON "public"."users"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "event_vouchers_code_key" ON "public"."event_vouchers"("code");

-- CreateIndex
CREATE INDEX "event_vouchers_eventId_idx" ON "public"."event_vouchers"("eventId");

-- CreateIndex
CREATE INDEX "event_vouchers_code_idx" ON "public"."event_vouchers"("code");

-- CreateIndex
CREATE INDEX "event_vouchers_startDate_endDate_idx" ON "public"."event_vouchers"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_invoiceNumber_key" ON "public"."transactions"("invoiceNumber");

-- CreateIndex
CREATE INDEX "transactions_userId_idx" ON "public"."transactions"("userId");

-- CreateIndex
CREATE INDEX "transactions_eventId_idx" ON "public"."transactions"("eventId");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "public"."transactions"("status");

-- CreateIndex
CREATE INDEX "transactions_expiryTime_idx" ON "public"."transactions"("expiryTime");

-- CreateIndex
CREATE INDEX "transactions_invoiceNumber_idx" ON "public"."transactions"("invoiceNumber");

-- CreateIndex
CREATE INDEX "transaction_items_transactionId_idx" ON "public"."transaction_items"("transactionId");

-- CreateIndex
CREATE INDEX "transaction_items_ticketTypeId_idx" ON "public"."transaction_items"("ticketTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_payments_transactionId_key" ON "public"."transaction_payments"("transactionId");

-- CreateIndex
CREATE INDEX "transaction_payments_transactionId_idx" ON "public"."transaction_payments"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_transactionId_key" ON "public"."reviews"("transactionId");

-- CreateIndex
CREATE INDEX "reviews_userId_idx" ON "public"."reviews"("userId");

-- CreateIndex
CREATE INDEX "reviews_eventId_idx" ON "public"."reviews"("eventId");

-- CreateIndex
CREATE INDEX "reviews_transactionId_idx" ON "public"."reviews"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_refereeId_key" ON "public"."referrals"("refereeId");

-- CreateIndex
CREATE INDEX "referrals_referrerId_idx" ON "public"."referrals"("referrerId");

-- CreateIndex
CREATE INDEX "referrals_refereeId_idx" ON "public"."referrals"("refereeId");

-- CreateIndex
CREATE INDEX "referrals_codeUsed_idx" ON "public"."referrals"("codeUsed");

-- CreateIndex
CREATE INDEX "user_points_userId_idx" ON "public"."user_points"("userId");

-- CreateIndex
CREATE INDEX "user_points_expiryDate_idx" ON "public"."user_points"("expiryDate");

-- CreateIndex
CREATE INDEX "user_points_isExpired_idx" ON "public"."user_points"("isExpired");

-- CreateIndex
CREATE UNIQUE INDEX "user_coupons_code_key" ON "public"."user_coupons"("code");

-- CreateIndex
CREATE INDEX "user_coupons_userId_idx" ON "public"."user_coupons"("userId");

-- CreateIndex
CREATE INDEX "user_coupons_code_idx" ON "public"."user_coupons"("code");

-- CreateIndex
CREATE INDEX "user_coupons_expiryDate_idx" ON "public"."user_coupons"("expiryDate");

-- CreateIndex
CREATE INDEX "user_coupons_isUsed_idx" ON "public"."user_coupons"("isUsed");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "public"."notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "public"."notifications"("isRead");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "public"."notifications"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "event_attendees_transactionId_key" ON "public"."event_attendees"("transactionId");

-- CreateIndex
CREATE INDEX "event_attendees_eventId_idx" ON "public"."event_attendees"("eventId");

-- CreateIndex
CREATE INDEX "event_attendees_userId_idx" ON "public"."event_attendees"("userId");

-- CreateIndex
CREATE INDEX "event_attendees_transactionId_idx" ON "public"."event_attendees"("transactionId");

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_ticket_types" ADD CONSTRAINT "event_ticket_types_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_vouchers" ADD CONSTRAINT "event_vouchers_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "public"."event_vouchers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "public"."user_coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaction_items" ADD CONSTRAINT "transaction_items_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaction_items" ADD CONSTRAINT "transaction_items_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "public"."event_ticket_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaction_payments" ADD CONSTRAINT "transaction_payments_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."referrals" ADD CONSTRAINT "referrals_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."referrals" ADD CONSTRAINT "referrals_refereeId_fkey" FOREIGN KEY ("refereeId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_points" ADD CONSTRAINT "user_points_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_coupons" ADD CONSTRAINT "user_coupons_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_coupons" ADD CONSTRAINT "user_coupons_couponTemplateId_fkey" FOREIGN KEY ("couponTemplateId") REFERENCES "public"."coupon_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_coupons" ADD CONSTRAINT "user_coupons_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "public"."referrals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_attendees" ADD CONSTRAINT "event_attendees_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_attendees" ADD CONSTRAINT "event_attendees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_attendees" ADD CONSTRAINT "event_attendees_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
