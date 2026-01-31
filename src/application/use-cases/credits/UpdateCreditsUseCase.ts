
import { UserCreditInfo } from '../../../domain/entities/UserCreditInfo';

export class UpdateCreditsUseCase {
  execute(currentCreditInfo: UserCreditInfo, creditsUsed: number): UserCreditInfo {
    return {
      ...currentCreditInfo,
      creditsRemaining: currentCreditInfo.creditsRemaining - creditsUsed,
      creditsUsed: currentCreditInfo.creditsUsed + creditsUsed
    };
  }
}
