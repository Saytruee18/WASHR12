import { 
  bookings, 
  walletTransactions, 
  vehicles, 
  cleanerApplications, 
  discountCodes,
  type Booking,
  type InsertBooking,
  type WalletTransaction,
  type InsertWalletTransaction,
  type Vehicle,
  type InsertVehicle,
  type CleanerApplication,
  type InsertCleanerApplication,
  type DiscountCode,
  type InsertDiscountCode
} from "@shared/schema";

export interface IStorage {
  // Bookings
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(id: number): Promise<Booking | undefined>;
  getBookings(): Promise<Booking[]>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
  
  // Wallet Transactions
  createWalletTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction>;
  getWalletTransactions(): Promise<WalletTransaction[]>;
  getWalletBalance(): Promise<number>;
  
  // Vehicles
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  getVehicles(): Promise<Vehicle[]>;
  updateVehicleLastWash(id: number): Promise<Vehicle | undefined>;
  
  // Cleaner Applications
  createCleanerApplication(application: InsertCleanerApplication): Promise<CleanerApplication>;
  getCleanerApplications(): Promise<CleanerApplication[]>;
  
  // Discount Codes
  getDiscountCode(code: string): Promise<DiscountCode | undefined>;
  createDiscountCode(discountCode: InsertDiscountCode): Promise<DiscountCode>;
}

export class MemStorage implements IStorage {
  private bookings: Map<number, Booking> = new Map();
  private walletTransactions: Map<number, WalletTransaction> = new Map();
  private vehicles: Map<number, Vehicle> = new Map();
  private cleanerApplications: Map<number, CleanerApplication> = new Map();
  private discountCodes: Map<string, DiscountCode> = new Map();
  
  private currentBookingId = 1;
  private currentWalletTransactionId = 1;
  private currentVehicleId = 1;
  private currentCleanerApplicationId = 1;
  private currentDiscountCodeId = 1;

  constructor() {
    // Initialize with some sample discount codes
    this.createDiscountCode({
      code: "WELCOME10",
      discountPercent: 10,
      discountAmount: null,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isActive: true,
    });
    
    this.createDiscountCode({
      code: "SAVE5",
      discountPercent: null,
      discountAmount: 500, // 5 EUR in cents
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
    });
  }

  // Bookings
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const booking: Booking = {
      ...insertBooking,
      id,
      status: "pending",
      createdAt: new Date(),
      color: insertBooking.color || null,
      licensePlate: insertBooking.licensePlate || null,
      latitude: insertBooking.latitude || null,
      longitude: insertBooking.longitude || null,
      discountCode: insertBooking.discountCode || null,
      stripePaymentIntentId: insertBooking.stripePaymentIntentId || null,
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (booking) {
      booking.status = status;
      this.bookings.set(id, booking);
      return booking;
    }
    return undefined;
  }

  // Wallet Transactions
  async createWalletTransaction(insertTransaction: InsertWalletTransaction): Promise<WalletTransaction> {
    const id = this.currentWalletTransactionId++;
    const transaction: WalletTransaction = {
      ...insertTransaction,
      id,
      createdAt: new Date(),
      stripePaymentIntentId: insertTransaction.stripePaymentIntentId || null,
    };
    this.walletTransactions.set(id, transaction);
    return transaction;
  }

  async getWalletTransactions(): Promise<WalletTransaction[]> {
    return Array.from(this.walletTransactions.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getWalletBalance(): Promise<number> {
    const transactions = await this.getWalletTransactions();
    return transactions.reduce((balance, transaction) => {
      return balance + transaction.amount;
    }, 0);
  }

  // Vehicles
  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const id = this.currentVehicleId++;
    const vehicle: Vehicle = {
      ...insertVehicle,
      id,
      lastWash: null,
      createdAt: new Date(),
      color: insertVehicle.color || null,
      licensePlate: insertVehicle.licensePlate || null,
    };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }

  async getVehicles(): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async updateVehicleLastWash(id: number): Promise<Vehicle | undefined> {
    const vehicle = this.vehicles.get(id);
    if (vehicle) {
      vehicle.lastWash = new Date();
      this.vehicles.set(id, vehicle);
      return vehicle;
    }
    return undefined;
  }

  // Cleaner Applications
  async createCleanerApplication(insertApplication: InsertCleanerApplication): Promise<CleanerApplication> {
    const id = this.currentCleanerApplicationId++;
    const application: CleanerApplication = {
      ...insertApplication,
      id,
      status: "pending",
      createdAt: new Date(),
      hasDriversLicense: insertApplication.hasDriversLicense || false,
      hasClearanceRecord: insertApplication.hasClearanceRecord || false,
      isOver18: insertApplication.isOver18 || false,
    };
    this.cleanerApplications.set(id, application);
    return application;
  }

  async getCleanerApplications(): Promise<CleanerApplication[]> {
    return Array.from(this.cleanerApplications.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  // Discount Codes
  async getDiscountCode(code: string): Promise<DiscountCode | undefined> {
    return this.discountCodes.get(code.toUpperCase());
  }

  async createDiscountCode(insertDiscountCode: InsertDiscountCode): Promise<DiscountCode> {
    const id = this.currentDiscountCodeId++;
    const discountCode: DiscountCode = {
      ...insertDiscountCode,
      id,
      code: insertDiscountCode.code.toUpperCase(),
      createdAt: new Date(),
      discountAmount: insertDiscountCode.discountAmount || null,
      discountPercent: insertDiscountCode.discountPercent || null,
      validUntil: insertDiscountCode.validUntil || null,
      isActive: insertDiscountCode.isActive !== undefined ? insertDiscountCode.isActive : true,
    };
    this.discountCodes.set(discountCode.code, discountCode);
    return discountCode;
  }
}

export const storage = new MemStorage();
