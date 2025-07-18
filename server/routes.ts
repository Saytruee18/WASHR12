import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { 
  insertBookingSchema, 
  insertWalletTransactionSchema, 
  insertVehicleSchema, 
  insertCleanerApplicationSchema 
} from "@shared/schema";
import { z } from "zod";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Bookings routes
  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      
      // Generate random estimated arrival time (15-40 minutes)
      const estimatedArrival = Math.floor(Math.random() * 25) + 15;
      
      const booking = await storage.createBooking(bookingData);
      
      res.json({ 
        booking, 
        estimatedArrival: `${estimatedArrival} Minuten` 
      });
    } catch (error: any) {
      res.status(400).json({ message: "Error creating booking: " + error.message });
    }
  });

  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching bookings: " + error.message });
    }
  });

  app.patch("/api/bookings/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const booking = await storage.updateBookingStatus(parseInt(id), status);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.json(booking);
    } catch (error: any) {
      res.status(500).json({ message: "Error updating booking: " + error.message });
    }
  });

  // Enhanced caching with rate limiting protection
  const geocodeCache = new Map<string, any>();
  const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  let lastApiCall = 0;
  const API_DELAY = 1000; // 1 second between API calls

  // Dynamic geocoding with complete input text processing
  app.get("/api/geocode", async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }

      // Process complete input text - no character limitations
      const searchQuery = q.trim();
      
      // Check cache first for instant response
      const cacheKey = searchQuery.toLowerCase();
      const cached = geocodeCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return res.json(cached.data);
      }

      // Simple rate limiting
      const now = Date.now();
      const timeSinceLastCall = now - lastApiCall;
      if (timeSinceLastCall < 500) {
        return res.json([]);
      }
      lastApiCall = now;

      // Simple API call
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      // Basic search URL
      const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=de&limit=5&q=${encodeURIComponent(searchQuery)}`;
      
      try {
        const response = await fetch(searchUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'WASHK App/1.0 (contact@washk.app)',
          },
        });
        
        clearTimeout(timeoutId);
        
        if (response.status === 429) {
          // Rate limited - cache empty result briefly and return empty
          geocodeCache.set(cacheKey, { data: [], timestamp: Date.now() });
          return res.json([]);
        }
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const results = await response.json();
        
        // Simple filtering
        const filteredResults = results
          .filter(place => place.address && (place.address.road || place.address.city))
          .slice(0, 5);

        // Cache the result for optimal performance
        geocodeCache.set(cacheKey, {
          data: filteredResults,
          timestamp: Date.now()
        });
        
        res.json(filteredResults);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        // Cache empty result briefly to avoid repeated failed calls
        geocodeCache.set(cacheKey, { 
          data: [], 
          timestamp: Date.now() - CACHE_DURATION + 30000 // Cache for only 30 seconds on error
        });
        
        res.json([]);
      }
    } catch (error: any) {
      res.json([]);
    }
  });

  // Reverse geocoding endpoint for GPS coordinates to address
  app.get('/api/reverse-geocode', async (req, res) => {
    try {
      const { lat, lng } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({ message: "Latitude and longitude parameters are required" });
      }

      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=de`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'WASHK App/1.0 (https://washk.app)',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result && result.address) {
        const address = result.address;
        const formattedAddress = `${address.road || ''} ${address.house_number || ''}, ${address.postcode || ''} ${address.city || address.town || address.village || ''}`.trim();
        
        res.json({
          address: formattedAddress,
          details: result
        });
      } else {
        res.status(404).json({ message: "No address found for coordinates" });
      }
    } catch (error: any) {
      console.error('Reverse geocoding API error:', error);
      res.status(500).json({ message: "Error fetching reverse geocoding data: " + error.message });
    }
  });

  // Wallet routes
  app.get("/api/wallet/balance", async (req, res) => {
    try {
      const balance = await storage.getWalletBalance();
      res.json({ balance });
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching balance: " + error.message });
    }
  });

  app.get("/api/wallet/transactions", async (req, res) => {
    try {
      const transactions = await storage.getWalletTransactions();
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching transactions: " + error.message });
    }
  });

  // Stripe payment intent for wallet top-up
  app.post("/api/wallet/topup", async (req, res) => {
    try {
      const { amount } = req.body;
      
      if (!amount || amount < 25) {
        return res.status(400).json({ message: "Minimum top-up amount is 25€" });
      }
      
      // Calculate bonus based on amount
      let bonus = 0;
      if (amount >= 100) bonus = 15;
      else if (amount >= 50) bonus = 5;
      else if (amount >= 25) bonus = 1.5;
      
      const totalAmount = amount + bonus;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "eur",
        metadata: {
          type: "wallet_topup",
          originalAmount: amount.toString(),
          bonusAmount: bonus.toString(),
          totalAmount: totalAmount.toString(),
        },
      });
      
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        bonus,
        totalAmount
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Stripe payment intent for booking
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, bookingId } = req.body;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "eur",
        metadata: {
          type: "booking_payment",
          bookingId: bookingId?.toString() || "",
        },
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Stripe webhook for payment confirmation
  app.post("/api/stripe/webhook", async (req, res) => {
    try {
      const event = req.body;
      
      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        const { type, originalAmount, bonusAmount, totalAmount } = paymentIntent.metadata;
        
        if (type === "wallet_topup") {
          // Add main amount
          await storage.createWalletTransaction({
            type: "topup",
            amount: Math.round(parseFloat(originalAmount) * 100),
            description: `Wallet aufgeladen: ${originalAmount}€`,
            stripePaymentIntentId: paymentIntent.id,
          });
          
          // Add bonus if applicable
          if (bonusAmount && parseFloat(bonusAmount) > 0) {
            await storage.createWalletTransaction({
              type: "bonus",
              amount: Math.round(parseFloat(bonusAmount) * 100),
              description: `Bonus erhalten: ${bonusAmount}€`,
              stripePaymentIntentId: paymentIntent.id,
            });
          }
        }
      }
      
      res.json({ received: true });
    } catch (error: any) {
      res.status(500).json({ message: "Webhook error: " + error.message });
    }
  });

  // Vehicles routes
  app.post("/api/vehicles", async (req, res) => {
    try {
      const vehicleData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(vehicleData);
      res.json(vehicle);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating vehicle: " + error.message });
    }
  });

  app.get("/api/vehicles", async (req, res) => {
    try {
      const vehicles = await storage.getVehicles();
      res.json(vehicles);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching vehicles: " + error.message });
    }
  });

  // Cleaner applications
  app.post("/api/cleaner-applications", async (req, res) => {
    try {
      const applicationData = insertCleanerApplicationSchema.parse(req.body);
      const application = await storage.createCleanerApplication(applicationData);
      res.json(application);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating application: " + error.message });
    }
  });

  app.get("/api/cleaner-applications", async (req, res) => {
    try {
      const applications = await storage.getCleanerApplications();
      res.json(applications);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching applications: " + error.message });
    }
  });

  // Discount codes
  app.post("/api/discount-codes/validate", async (req, res) => {
    try {
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ message: "Code is required" });
      }
      
      const discountCode = await storage.getDiscountCode(code);
      
      if (!discountCode) {
        return res.status(404).json({ message: "Rabattcode nicht gefunden" });
      }
      
      if (!discountCode.isActive) {
        return res.status(400).json({ message: "Rabattcode ist nicht aktiv" });
      }
      
      if (discountCode.validUntil && new Date() > discountCode.validUntil) {
        return res.status(400).json({ message: "Rabattcode ist abgelaufen" });
      }
      
      res.json({
        valid: true,
        discountPercent: discountCode.discountPercent,
        discountAmount: discountCode.discountAmount,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error validating code: " + error.message });
    }
  });

  // Location validation
  app.post("/api/validate-location", async (req, res) => {
    try {
      const { address, latitude, longitude } = req.body;
      
      // Simple validation for Mainz area
      const isInMainz = address.toLowerCase().includes('mainz') || 
                       (latitude && longitude && 
                        latitude >= 49.9 && latitude <= 50.1 && 
                        longitude >= 8.1 && longitude <= 8.4);
      
      res.json({ 
        valid: isInMainz,
        message: isInMainz ? "Standort bestätigt" : "Dieser Ort liegt außerhalb unseres Servicebereichs"
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error validating location: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
