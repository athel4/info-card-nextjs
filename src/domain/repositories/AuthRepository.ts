
import { User } from '../entities/User';

export interface AuthRepository {
  signUp(email: string, password: string, fullName?: string): Promise<User>;
  signIn(email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  getCurrentSession(): Promise<any>;
}
