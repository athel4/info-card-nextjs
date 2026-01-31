
import { AuthRepository } from '../../../domain/repositories/AuthRepository';
import { ActivityLogRepository } from '../../../domain/repositories/ActivityLogRepository';
import { User } from '../../../domain/entities/User';

export class SignUpUseCase {
  constructor(
    private authRepository: AuthRepository,
    private activityLogRepository: ActivityLogRepository
  ) {}

  async execute(email: string, password: string, fullName?: string): Promise<User> {
    const user = await this.authRepository.signUp(email, password, fullName);
    
    // Only log activity if we have a valid user ID (don't log for email confirmation cases)
    if (user.id) {
      try {
        await this.activityLogRepository.createActivityLog({
          userId: user.id,
          action: 'user_signup',
          details: { email, fullName }
        });
      } catch (error) {
        // Don't fail signup if activity logging fails
        console.warn('Failed to log signup activity:', error);
      }
    }

    return user;
  }
}
