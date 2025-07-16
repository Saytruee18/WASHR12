// Simple authentication storage for demo purposes
export interface User {
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  joinDate: Date;
}

const AUTH_STORAGE_KEY = 'washr_user';

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
        joinDate: new Date(user.joinDate)
      };
    } catch (error) {
      console.error('Error loading user:', error);
      return null;
    }
  },

  login(email: string, password: string): User {
    // Demo login - any email/password combination works
    const firstName = email.split('@')[0].split('.')[0];
    const lastName = email.split('@')[0].split('.')[1] || email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
    
    const user: User = {
      email,
      firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
      lastName: lastName.charAt(0).toUpperCase() + lastName.slice(1),
      joinDate: new Date()
    };
    
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  updateProfile(updates: Partial<User>): User | null {
    const user = this.getUser();
    if (!user) return null;
    
    const updatedUser = { ...user, ...updates };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  }
};