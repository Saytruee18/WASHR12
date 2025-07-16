// Enhanced authentication storage with real-time user data sync
export interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  profilePicture?: string;
  joinDate: Date;
  bookings: number;
  lastBookingDate?: Date;
}

export interface UserBookingData {
  bookings: number;
  lastBookingDate?: Date;
  earnedRewards: string[];
  availableRewards: string[];
}

const AUTH_STORAGE_KEY = 'washr_user';
const USER_DATA_KEY = 'washr_user_data';

export const authStorage = {
  isLoggedIn(): boolean {
    return localStorage.getItem(AUTH_STORAGE_KEY) !== null;
  },

  getUser(): User | null {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return null;
      
      const user = JSON.parse(stored);
      return {
        ...user,
        joinDate: new Date(user.joinDate),
        lastBookingDate: user.lastBookingDate ? new Date(user.lastBookingDate) : undefined
      };
    } catch (error) {
      console.error('Error loading user:', error);
      return null;
    }
  },

  getUserData(): UserBookingData | null {
    try {
      const stored = localStorage.getItem(USER_DATA_KEY);
      if (!stored) return null;
      
      const data = JSON.parse(stored);
      return {
        ...data,
        lastBookingDate: data.lastBookingDate ? new Date(data.lastBookingDate) : undefined
      };
    } catch (error) {
      console.error('Error loading user data:', error);
      return null;
    }
  },

  login(email: string, password: string): User {
    // Demo login - any email/password combination works
    const emailParts = email.split('@')[0].split('.');
    const firstName = emailParts[0];
    const lastName = emailParts[1] || emailParts[0];
    
    const user: User = {
      uid: btoa(email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20),
      email,
      firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
      lastName: lastName.charAt(0).toUpperCase() + lastName.slice(1),
      displayName: `${firstName.charAt(0).toUpperCase() + firstName.slice(1)} ${lastName.charAt(0).toUpperCase() + lastName.slice(1)}`,
      joinDate: new Date(),
      bookings: 0
    };
    
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  },

  updateProfile(updates: Partial<User>): User | null {
    const user = this.getUser();
    if (!user) return null;
    
    const updatedUser = { ...user, ...updates };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  },

  updateUserData(data: Partial<UserBookingData>): UserBookingData {
    const current = this.getUserData() || {
      bookings: 0,
      earnedRewards: [],
      availableRewards: []
    };
    
    const updated = { ...current, ...data };
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(updated));
    return updated;
  },

  incrementUserBookings(): UserBookingData {
    const userData = this.getUserData() || {
      bookings: 0,
      earnedRewards: [],
      availableRewards: []
    };
    
    const updated = {
      ...userData,
      bookings: userData.bookings + 1,
      lastBookingDate: new Date()
    };
    
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(updated));
    return updated;
  },

  mergeGuestBookingsWithUser(guestBookings: number): UserBookingData {
    const currentData = this.getUserData() || {
      bookings: 0,
      earnedRewards: [],
      availableRewards: []
    };
    
    const merged = {
      ...currentData,
      bookings: Math.max(currentData.bookings, guestBookings),
      lastBookingDate: new Date()
    };
    
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(merged));
    return merged;
  }
};