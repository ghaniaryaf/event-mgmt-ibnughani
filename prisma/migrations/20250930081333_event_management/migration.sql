/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `coupon_templates` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "coupon_templates_name_key" ON "public"."coupon_templates"("name");
