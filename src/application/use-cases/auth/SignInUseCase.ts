
import { AuthRepository } from '../../../domain/repositories/AuthRepository';
import { ActivityLogRepository } from '../../../domain/repositories/ActivityLogRepository';
import { User } from '../../../domain/entities/User';

export class SignInUseCase {
  constructor(
    private authRepository: AuthRepository,
    private activityLogRepository: ActivityLogRepository
  ) {}

  async execute(email: string, password: string): Promise<User> {
    const user = await this.authRepository.signIn(email, password);
    
    // Log signin activity
    await this.activityLogRepository.createActivityLog({
      userId: user.id,
      action: 'user_signin',
      details: { email }
    });

    return user;
  }
}
