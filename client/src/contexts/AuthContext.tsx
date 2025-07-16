// Firebase Auth Context for user authentication state management
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  bookings: number;
  lastBookingDate?: Date;
  joinDate: Date;
  earnedRewards: string[];
  availableRewards: string[];
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserBookings: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from Firestore
  const fetchUserData = async (uid: string): Promise<UserData | null> => {
    if (!isFirebaseConfigured || !db) return null;

    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          joinDate: data.joinDate?.toDate() || new Date(),
          lastBookingDate: data.lastBookingDate?.toDate() || undefined
        } as UserData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  // Merge guest bookings with user data
  const mergeGuestBookings = async (uid: string) => {
    if (!isFirebaseConfigured || !db) return 0;

    try {
      const guestBookings = parseInt(localStorage.getItem('guestBookings') || '0');
      if (guestBookings > 0) {
        const userRef = doc(db, 'users', uid);
        const snap = await getDoc(userRef);
        const currentBookings = snap.exists() ? snap.data().bookings || 0 : 0;
        
        await setDoc(userRef, { 
          bookings: Math.max(currentBookings, guestBookings),
          lastBookingDate: new Date()
        }, { merge: true });
        
        localStorage.removeItem('guestBookings');
        return guestBookings;
      }
      return 0;
    } catch (error) {
      console.error('Error merging guest bookings:', error);
      return 0;
    }
  };

  // Refresh user data from Firestore
  const refreshUserData = async () => {
    if (user) {
      const data = await fetchUserData(user.uid);
      setUserData(data);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    if (!isFirebaseConfigured || !auth) {
      console.warn('Firebase not configured, using localStorage fallback');
      // Fallback to localStorage with immediate state update
      const firstName = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const lastName = firstName.split(' ').slice(1).join(' ') || '';
      const displayName = firstName;
      
      localStorage.setItem('washr_logged_in', 'true');
      localStorage.setItem('washr_user_email', email);
      localStorage.setItem('washr_user_firstName', firstName);
      localStorage.setItem('washr_user_lastName', lastName);
      
      // Merge guest bookings immediately
      const guestBookings = parseInt(localStorage.getItem('guestBookings') || '0');
      if (guestBookings > 0) {
        localStorage.setItem('userBookings', guestBookings.toString());
        localStorage.removeItem('guestBookings');
      }
      
      // Update state immediately for instant UI response
      const mockUser = {
        uid: email,
        email: email,
        displayName: displayName
      } as User;
      
      const mockUserData = {
        uid: email,
        email: email,
        displayName: displayName,
        firstName: firstName,
        lastName: lastName,
        bookings: guestBookings,
        joinDate: new Date(),
        earnedRewards: [],
        availableRewards: []
      } as UserData;
      
      setUser(mockUser);
      setUserData(mockUserData);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const mergedBookings = await mergeGuestBookings(userCredential.user.uid);
      
      if (mergedBookings > 0) {
        console.log(`${mergedBookings} guest bookings merged successfully`);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Anmeldung fehlgeschlagen');
    }
  };

  // Register function
  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    if (!isFirebaseConfigured || !auth || !db) {
      console.warn('Firebase not configured, using localStorage fallback');
      // Fallback to localStorage with immediate state update
      const displayName = `${firstName} ${lastName}`;
      
      localStorage.setItem('washr_logged_in', 'true');
      localStorage.setItem('washr_user_email', email);
      localStorage.setItem('washr_user_firstName', firstName);
      localStorage.setItem('washr_user_lastName', lastName);
      
      // Merge guest bookings immediately
      const guestBookings = parseInt(localStorage.getItem('guestBookings') || '0');
      if (guestBookings > 0) {
        localStorage.setItem('userBookings', guestBookings.toString());
        localStorage.removeItem('guestBookings');
      }
      
      // Update state immediately for instant UI response
      const mockUser = {
        uid: email,
        email: email,
        displayName: displayName
      } as User;
      
      const mockUserData = {
        uid: email,
        email: email,
        displayName: displayName,
        firstName: firstName,
        lastName: lastName,
        bookings: guestBookings,
        joinDate: new Date(),
        earnedRewards: [],
        availableRewards: []
      } as UserData;
      
      setUser(mockUser);
      setUserData(mockUserData);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });

      // Create user document in Firestore
      const userData: Partial<UserData> = {
        uid: user.uid,
        email: user.email || '',
        displayName: `${firstName} ${lastName}`,
        firstName,
        lastName,
        bookings: 0,
        joinDate: new Date(),
        earnedRewards: [],
        availableRewards: []
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      
      // Merge any guest bookings
      await mergeGuestBookings(user.uid);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registrierung fehlgeschlagen');
    }
  };

  // Logout function
  const logout = async () => {
    if (!isFirebaseConfigured || !auth) {
      // Fallback localStorage logout with immediate state update
      localStorage.removeItem('washr_logged_in');
      localStorage.removeItem('washr_user_email');
      localStorage.removeItem('washr_user_firstName');
      localStorage.removeItem('washr_user_lastName');
      localStorage.removeItem('userBookings');
      
      // Reset state immediately
      setUser(null);
      setUserData(null);
      return;
    }

    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Abmeldung fehlgeschlagen');
    }
  };

  // Update user bookings
  const updateUserBookings = async () => {
    if (!user || !isFirebaseConfigured || !db) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      const currentBookings = snap.exists() ? snap.data().bookings || 0 : 0;
      
      await setDoc(userRef, { 
        bookings: currentBookings + 1,
        lastBookingDate: new Date()
      }, { merge: true });
      
      // Refresh user data
      await refreshUserData();
    } catch (error) {
      console.error('Error updating bookings:', error);
      throw error;
    }
  };

  // Auth state listener with localStorage fallback
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      // Check localStorage for existing login
      const savedLogin = localStorage.getItem('washr_logged_in');
      if (savedLogin === 'true') {
        const email = localStorage.getItem('washr_user_email') || '';
        const firstName = localStorage.getItem('washr_user_firstName') || '';
        const lastName = localStorage.getItem('washr_user_lastName') || '';
        const userBookings = parseInt(localStorage.getItem('userBookings') || '0');
        
        const mockUser = {
          uid: email,
          email: email,
          displayName: `${firstName} ${lastName}`.trim()
        } as User;
        
        const mockUserData = {
          uid: email,
          email: email,
          displayName: `${firstName} ${lastName}`.trim(),
          firstName: firstName,
          lastName: lastName,
          bookings: userBookings,
          joinDate: new Date(),
          earnedRewards: [],
          availableRewards: []
        } as UserData;
        
        setUser(mockUser);
        setUserData(mockUserData);
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        const data = await fetchUserData(user.uid);
        setUserData(data);
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    userData,
    loading,
    login,
    register,
    logout,
    updateUserBookings,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};