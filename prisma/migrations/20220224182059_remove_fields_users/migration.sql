/*
  Warnings:

  - You are about to drop the column `is_activated` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `is_personal` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "is_activated",
DROP COLUMN "is_personal";
