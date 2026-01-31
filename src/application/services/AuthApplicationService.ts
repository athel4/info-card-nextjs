import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { DailyCreditRepository } from '../../domain/repositories/DailyCreditRepository';
import { UserPackageRepository } from '../../domain/repositories/UserPackageRepository';
import { BusinessCardContactRepository } from '../../domain/repositories/BusinessCardContactRepository';
import { User } from '../../domain/entities/User';
import { getAnonymousSessionId, clearAnonymousSession } from '../../utils/anonymousSession';

export interface SignUpRequest {
  email: string;
  password: string;
  fullName?: string;
}

export interface SignUpResponse {
  user: User;
  needsEmailConfirmation: boolean;
}

export class AuthApplicationService {
  constructor(
    private authRepository: AuthRepository,
    private dailyCreditRepository: DailyCreditRepository,
    private userPackageRepository: UserPackageRepository,
    private contactRepository: BusinessCardContactRepository
  ) {}

  async signUp(request: SignUpRequest): Promise<SignUpResponse> {
    const user = await this.authRepository.signUp(request.email, request.password, request.fullName);
    
    // Check if session exists (no email confirmation needed)
    const session = await this.authRepository.getCurrentSession();
    
    if (session) {
      // Grant daily credits and soft launch bonus for new user
      setTimeout(async () => {
        try {
          await this.dailyCreditRepository.grantDailyCredits(user.id);
          console.log('Daily credits granted for new user sign-up');
          
          // Migrate anonymous contacts to user account
          await this.migrateAnonymousData(user.id);
          
          // Grant soft launch bonus (50 credits) if enabled
          const isEnabled = process.env.NEXT_PUBLIC_SOFT_LAUNCH_BONUS_ENABLED === 'true';
          if (isEnabled) {
            // Wait for user package to be created by auth trigger, then add bonus
            setTimeout(async () => {
              try {
                await this.userPackageRepository.addBonusCredits(user.id, 50);
                console.log('Soft launch bonus (50 credits) granted to new user');
              } catch (error) {
                console.error('Error granting soft launch bonus:', error);
              }
            }, 2000); // Wait 2 seconds for auth trigger to create user package
          }
        } catch (error) {
          console.error('Error granting daily credits for new user:', error);
        }
      }, 0);
      
      return { user, needsEmailConfirmation: false };
    }
    
    return { user, needsEmailConfirmation: true };
  }

  async signIn(email: string, password: string): Promise<User> {
    const user = await this.authRepository.signIn(email, password);
    
    // Migrate anonymous data after successful sign in
    await this.migrateAnonymousData(user.id);
    
    return user;
  }

  async signOut(): Promise<void> {
    return this.authRepository.signOut();
  }

  async getCurrentUser(): Promise<User | null> {
    const session = await this.authRepository.getCurrentSession();
    return session?.user || null;
  }

  async getCurrentSession() {
    return this.authRepository.getCurrentSession();
  }

  private async migrateAnonymousData(userId: string): Promise<void> {
    const sessionId = localStorage.getItem('anonymous_session_id');
    
    if (!sessionId) {
      return; // No anonymous data to migrate
    }
    
    try {
      await this.contactRepository.migrateAnonymousContactsToUser(userId, sessionId);
      console.log('Anonymous contacts migrated to user account');
      
      // Clear localStorage after successful migration
      clearAnonymousSession();
      console.log('Anonymous session cleared from localStorage');
    } catch (error) {
      console.error('Error migrating anonymous contacts:', error);
      // Don't clear localStorage on error - allow retry
    }
  }
}