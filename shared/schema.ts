import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  packageType: text("package_type").notNull(), // außenwäsche, innen-außen, komplett
  vehicleType: text("vehicle_type").notNull(), // kleinwagen, mittelklasse, suv, transporter
  vehicleModel: text("vehicle_model").notNull(),
  licensePlate: text("license_plate"),
  color: text("color"),
  location: text("location").notNull(),
  latitude: text("latitude"),
  longitude: text("longitude"),
  bookingDate: timestamp("booking_date").notNull(),
  timeSlot: text("time_slot").notNull(),
  price: integer("price").notNull(), // in cents
  paymentMethod: text("payment_method").notNull(), // wallet, stripe
  discountCode: text("discount_code"),
  discountAmount: integer("discount_amount").default(0),
  status: text("status").default("pending"), // pending, confirmed, in_progress, completed, cancelled
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const walletTransactions = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // topup, payment, bonus
  amount: integer("amount").notNull(), // in cents
  description: text("description").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  model: text("model").notNull(),
  licensePlate: text("license_plate"),
  color: text("color"),
  lastWash: timestamp("last_wash"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cleanerApplications = pgTable("cleaner_applications", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  motivation: text("motivation").notNull(),
  hasDriversLicense: boolean("has_drivers_license").default(false),
  hasClearanceRecord: boolean("has_clearance_record").default(false),
  isOver18: boolean("is_over_18").default(false),
  status: text("status").default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

export const discountCodes = pgTable("discount_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  discountPercent: integer("discount_percent"),
  discountAmount: integer("discount_amount"), // in cents
  validUntil: timestamp("valid_until"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertWalletTransactionSchema = createInsertSchema(walletTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
  lastWash: true,
});

export const insertCleanerApplicationSchema = createInsertSchema(cleanerApplications).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertDiscountCodeSchema = createInsertSchema(discountCodes).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;
export type WalletTransaction = typeof walletTransactions.$inferSelect;

export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

export type InsertCleanerApplication = z.infer<typeof insertCleanerApplicationSchema>;
export type CleanerApplication = typeof cleanerApplications.$inferSelect;

export type InsertDiscountCode = z.infer<typeof insertDiscountCodeSchema>;
export type DiscountCode = typeof discountCodes.$inferSelect;
