// Firebase Auth Context for user authentication state management
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  AuthError
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
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
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserBookings: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  validatePassword: (password: string, email?: string) => { isValid: boolean; errors: string[] };
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

  // Create or update user in Firestore
  const createOrUpdateUser = async (user: User, additionalData?: Partial<UserData>) => {
    if (!isFirebaseConfigured || !db) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      
      if (!snap.exists()) {
        // Create new user document
        const userData: Partial<UserData> = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          firstName: additionalData?.firstName || user.displayName?.split(' ')[0] || '',
          lastName: additionalData?.lastName || user.displayName?.split(' ').slice(1).join(' ') || '',
          bookings: 0,
          joinDate: new Date(),
          earnedRewards: [],
          availableRewards: [],
          ...additionalData
        };
        
        await setDoc(userRef, {
          ...userData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        // Update existing user
        await setDoc(userRef, {
          updatedAt: serverTimestamp(),
          ...additionalData
        }, { merge: true });
      }
    } catch (error) {
      console.error('Error creating/updating user:', error);
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
          lastBookingDate: new Date(),
          updatedAt: serverTimestamp()
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

  // Password validation function
  const validatePassword = (password: string, email?: string) => {
    const errors: string[] = [];
    
    if (password.length < 6) {
      errors.push('Mindestens 6 Zeichen erforderlich');
    }
    
    if (!/[A-Za-z]/.test(password)) {
      errors.push('Muss mindestens einen Buchstaben enthalten');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Muss mindestens eine Zahl enthalten');
    }
    
    if (email && password.toLowerCase() === email.toLowerCase()) {
      errors.push('Passwort darf nicht identisch mit E-Mail sein');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
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
      
      localStorage.setItem('washk_logged_in', 'true');
      localStorage.setItem('washk_user_email', email);
      localStorage.setItem('washk_user_firstName', firstName);
      localStorage.setItem('washk_user_lastName', lastName);
      
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
      const authError = error as AuthError;
      
      // Provide user-friendly error messages
      let errorMessage = 'Anmeldung fehlgeschlagen';
      switch (authError.code) {
        case 'auth/user-not-found':
          errorMessage = 'Kein Benutzer mit dieser E-Mail-Adresse gefunden';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Falsches Passwort';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Ungültige E-Mail-Adresse';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Dieser Benutzer wurde deaktiviert';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Zu viele Anmeldeversuche. Bitte versuchen Sie es später erneut';
          break;
        default:
          errorMessage = authError.message || 'Anmeldung fehlgeschlagen';
      }
      
      throw new Error(errorMessage);
    }
  };

  // Register function
  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    if (!isFirebaseConfigured || !auth || !db) {
      console.warn('Firebase not configured, using localStorage fallback');
      // Fallback to localStorage with immediate state update
      const displayName = `${firstName} ${lastName}`;
      
      localStorage.setItem('washk_logged_in', 'true');
      localStorage.setItem('washk_user_email', email);
      localStorage.setItem('washk_user_firstName', firstName);
      localStorage.setItem('washk_user_lastName', lastName);
      
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
      await createOrUpdateUser(user, {
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`,
        bookings: 0,
        joinDate: new Date(),
        earnedRewards: [],
        availableRewards: []
      });
      
      // Merge any guest bookings
      await mergeGuestBookings(user.uid);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      const authError = error as AuthError;
      
      // Provide user-friendly error messages
      let errorMessage = 'Registrierung fehlgeschlagen';
      switch (authError.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'E-Mail-Adresse wird bereits verwendet';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Ungültige E-Mail-Adresse';
          break;
        case 'auth/weak-password':
          errorMessage = 'Passwort ist zu schwach';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Registrierung ist derzeit nicht verfügbar';
          break;
        default:
          errorMessage = authError.message || 'Registrierung fehlgeschlagen';
      }
      
      throw new Error(errorMessage);
    }
  };

  // Logout function
  const logout = async () => {
    if (!isFirebaseConfigured || !auth) {
      // Fallback localStorage logout with immediate state update
      localStorage.removeItem('washk_logged_in');
      localStorage.removeItem('washk_user_email');
      localStorage.removeItem('washk_user_firstName');
      localStorage.removeItem('washk_user_lastName');
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

  // Google login function
  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth) {
      // Demo fallback for when Firebase is not configured
      const mockUser = {
        uid: 'google-demo-user',
        email: 'demo@google.com',
        displayName: 'Google Demo User'
      } as User;
      
      const mockUserData = {
        uid: 'google-demo-user',
        email: 'demo@google.com',
        displayName: 'Google Demo User',
        firstName: 'Google',
        lastName: 'User',
        bookings: 0,
        joinDate: new Date(),
        earnedRewards: [],
        availableRewards: []
      } as UserData;
      
      // Store in localStorage for demo
      localStorage.setItem('washk_logged_in', 'true');
      localStorage.setItem('washk_user_email', 'demo@google.com');
      localStorage.setItem('washk_user_firstName', 'Google');
      localStorage.setItem('washk_user_lastName', 'User');
      
      // Merge guest bookings
      const guestBookings = parseInt(localStorage.getItem('guestBookings') || '0');
      if (guestBookings > 0) {
        localStorage.setItem('userBookings', guestBookings.toString());
        localStorage.removeItem('guestBookings');
        mockUserData.bookings = guestBookings;
      }
      
      setUser(mockUser);
      setUserData(mockUserData);
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      await createOrUpdateUser(result.user);
      await mergeGuestBookings(result.user.uid);
      
    } catch (error: any) {
      console.error('Google login error:', error);
      const authError = error as AuthError;
      
      let errorMessage = 'Google-Anmeldung fehlgeschlagen';
      switch (authError.code) {
        case 'auth/configuration-not-found':
          errorMessage = 'Google-Anmeldung ist derzeit nicht verfügbar (Demo-Modus)';
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'Ein Konto mit dieser E-Mail-Adresse existiert bereits';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = 'Anmeldung wurde abgebrochen';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Popup wurde blockiert. Bitte erlauben Sie Popups';
          break;
        case 'auth/popup-closed-by-user':
          errorMessage = 'Anmeldung wurde abgebrochen';
          break;
        default:
          errorMessage = authError.message || 'Google-Anmeldung fehlgeschlagen';
      }
      
      throw new Error(errorMessage);
    }
  };

  // Facebook login function
  const loginWithFacebook = async () => {
    if (!isFirebaseConfigured || !auth) {
      // Demo fallback for when Firebase is not configured
      const mockUser = {
        uid: 'facebook-demo-user',
        email: 'demo@facebook.com',
        displayName: 'Facebook Demo User'
      } as User;
      
      const mockUserData = {
        uid: 'facebook-demo-user',
        email: 'demo@facebook.com',
        displayName: 'Facebook Demo User',
        firstName: 'Facebook',
        lastName: 'User',
        bookings: 0,
        joinDate: new Date(),
        earnedRewards: [],
        availableRewards: []
      } as UserData;
      
      // Store in localStorage for demo
      localStorage.setItem('washk_logged_in', 'true');
      localStorage.setItem('washk_user_email', 'demo@facebook.com');
      localStorage.setItem('washk_user_firstName', 'Facebook');
      localStorage.setItem('washk_user_lastName', 'User');
      
      // Merge guest bookings
      const guestBookings = parseInt(localStorage.getItem('guestBookings') || '0');
      if (guestBookings > 0) {
        localStorage.setItem('userBookings', guestBookings.toString());
        localStorage.removeItem('guestBookings');
        mockUserData.bookings = guestBookings;
      }
      
      setUser(mockUser);
      setUserData(mockUserData);
      return;
    }

    try {
      const provider = new FacebookAuthProvider();
      provider.addScope('email');
      
      const result = await signInWithPopup(auth, provider);
      await createOrUpdateUser(result.user);
      await mergeGuestBookings(result.user.uid);
      
    } catch (error: any) {
      console.error('Facebook login error:', error);
      const authError = error as AuthError;
      
      let errorMessage = 'Facebook-Anmeldung fehlgeschlagen';
      switch (authError.code) {
        case 'auth/configuration-not-found':
          errorMessage = 'Facebook-Anmeldung ist derzeit nicht verfügbar (Demo-Modus)';
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'Ein Konto mit dieser E-Mail-Adresse existiert bereits';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = 'Anmeldung wurde abgebrochen';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Popup wurde blockiert. Bitte erlauben Sie Popups';
          break;
        case 'auth/popup-closed-by-user':
          errorMessage = 'Anmeldung wurde abgebrochen';
          break;
        default:
          errorMessage = authError.message || 'Facebook-Anmeldung fehlgeschlagen';
      }
      
      throw new Error(errorMessage);
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
        lastBookingDate: new Date(),
        updatedAt: serverTimestamp()
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
      const savedLogin = localStorage.getItem('washk_logged_in');
      if (savedLogin === 'true') {
        const email = localStorage.getItem('washk_user_email') || '';
        const firstName = localStorage.getItem('washk_user_firstName') || '';
        const lastName = localStorage.getItem('washk_user_lastName') || '';
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
    loginWithGoogle,
    loginWithFacebook,
    logout,
    updateUserBookings,
    refreshUserData,
    validatePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};