// Dependency Injection Container
import { SupabaseAuthRepository } from '../repositories/SupabaseAuthRepository';
import { SupabaseUserRepository } from '../repositories/SupabaseUserRepository';
import { SupabasePackageRepository } from '../repositories/SupabasePackageRepository';
import { SupabaseUserPackageRepository } from '../repositories/SupabaseUserPackageRepository';
import { SupabaseCreditUsageRepository } from '../repositories/SupabaseCreditUsageRepository';
import { SupabaseActivityLogRepository } from '../repositories/SupabaseActivityLogRepository';
import { SupabaseBusinessCardSessionRepository } from '../repositories/SupabaseBusinessCardSessionRepository';
import { SupabaseBusinessCardContactRepository } from '../repositories/SupabaseBusinessCardContactRepository';
import { SupabaseDailyCreditRepository } from '../repositories/SupabaseDailyCreditRepository';
import { SupabaseTemplateRepository } from '../repositories/SupabaseTemplateRepository';
import { SupabaseContactOutreachRepository } from '../repositories/SupabaseContactOutreachRepository';
import { SupabasePaymentRepository } from '../repositories/SupabasePaymentRepository';
import { SupabaseUserPackageHistoryRepository } from '../repositories/SupabaseUserPackageHistoryRepository';
import { SupabaseAIProcessingRepository } from '../repositories/SupabaseAIProcessingRepository';

import { SignUpUseCase } from '../../application/use-cases/auth/SignUpUseCase';
import { SignInUseCase } from '../../application/use-cases/auth/SignInUseCase';
import { GetUserPackagesUseCase } from '../../application/use-cases/packages/GetUserPackagesUseCase';
import { CreatePackageUseCase } from '../../application/use-cases/packages/CreatePackageUseCase';
import { DeductCreditsUseCase } from '../../application/use-cases/credits/DeductCreditsUseCase';
import { SaveBusinessCardSessionUseCase } from '../../application/use-cases/sessions/SaveBusinessCardSessionUseCase';
import { GetUserSessionsUseCase } from '../../application/use-cases/sessions/GetUserSessionsUseCase';
import { CreateBusinessCardContactUseCase } from '../../application/use-cases/contacts/CreateBusinessCardContactUseCase';
import { GetSessionContactsUseCase } from '../../application/use-cases/contacts/GetSessionContactsUseCase';
import { UpdateBusinessCardContactUseCase } from '../../application/use-cases/contacts/UpdateBusinessCardContactUseCase';
import { GetUserCreditsUseCase } from '../../application/use-cases/credits/GetUserCreditsUseCase';
import { RefreshUserCreditsUseCase } from '../../application/use-cases/credits/RefreshUserCreditsUseCase';
import { UpdateCreditsUseCase } from '../../application/use-cases/credits/UpdateCreditsUseCase';
import { GetDailyCreditsUseCase } from '../../application/use-cases/credits/GetDailyCreditsUseCase';
import { DeductDailyCreditsUseCase } from '../../application/use-cases/credits/DeductDailyCreditsUseCase';
import { ResetDailyCreditsUseCase } from '../../application/use-cases/credits/ResetDailyCreditsUseCase';
import { GrantDailyCreditsUseCase } from '../../application/use-cases/credits/GrantDailyCreditsUseCase';
import { GrantSoftLaunchBonusUseCase } from '../../application/use-cases/credits/GrantSoftLaunchBonusUseCase';
import { GetAllUserContactsUseCase } from '../../application/use-cases/contacts/GetAllUserContactsUseCase';
import { DeleteContactUseCase } from '../../application/use-cases/contacts/DeleteContactUseCase';
import { CreateTemplateUseCase } from '../../application/use-cases/templates/CreateTemplateUseCase';
import { GetUserTemplatesUseCase } from '../../application/use-cases/templates/GetUserTemplatesUseCase';
import { UpdateTemplateUseCase } from '../../application/use-cases/templates/UpdateTemplateUseCase';
import { DeleteTemplateUseCase } from '../../application/use-cases/templates/DeleteTemplateUseCase';
import { GetContactActionsUseCase } from '../../application/use-cases/outreach/GetContactActionsUseCase';
import { GenerateOutreachPackageUseCase } from '../../application/use-cases/outreach/GenerateOutreachPackageUseCase';
import { CreateCheckoutSessionUseCase } from '../../application/use-cases/payments/CreateCheckoutSessionUseCase';
import { ProcessPaymentWebhookUseCase } from '../../application/use-cases/payments/ProcessPaymentWebhookUseCase';
import { GetUserPackageHistoryUseCase } from '../../application/use-cases/packages/GetUserPackageHistoryUseCase';
import { UpdateUserPackageHistoryUseCase } from '../../application/use-cases/packages/UpdateUserPackageHistoryUseCase';
import { PaymentApplicationService } from '../../application/services/PaymentApplicationService';
import { SubscriptionApplicationService } from '../../application/services/SubscriptionApplicationService';
import { CreditApplicationService } from '../../application/services/CreditApplicationService';
import { TemplateApplicationService } from '../../application/services/TemplateApplicationService';
import { BusinessCardApplicationService } from '../../application/services/BusinessCardApplicationService';
import { AuthApplicationService } from '../../application/services/AuthApplicationService';
import { ContactApplicationService } from '../../application/services/ContactApplicationService';
import { AdminApplicationService } from '../../application/services/AdminApplicationService';

class Container {
  // Repositories
  private _authRepository = new SupabaseAuthRepository();
  private _userRepository = new SupabaseUserRepository();
  private _packageRepository = new SupabasePackageRepository();
  private _userPackageRepository = new SupabaseUserPackageRepository();
  private _creditUsageRepository = new SupabaseCreditUsageRepository();
  private _activityLogRepository = new SupabaseActivityLogRepository();
  private _businessCardSessionRepository = new SupabaseBusinessCardSessionRepository();
  private _businessCardContactRepository = new SupabaseBusinessCardContactRepository();
  private _dailyCreditRepository = new SupabaseDailyCreditRepository();
  private _templateRepository = new SupabaseTemplateRepository();
  private _contactOutreachRepository = new SupabaseContactOutreachRepository();
  private _paymentRepository = new SupabasePaymentRepository();
  private _userPackageHistoryRepository = new SupabaseUserPackageHistoryRepository();
  private _aiProcessingRepository = new SupabaseAIProcessingRepository();

  // Use Cases
  private _signUpUseCase = new SignUpUseCase(this._authRepository, this._activityLogRepository);
  private _signInUseCase = new SignInUseCase(this._authRepository, this._activityLogRepository);
  private _getUserPackagesUseCase = new GetUserPackagesUseCase(this._userPackageRepository);
  private _createPackageUseCase = new CreatePackageUseCase(this._packageRepository);
  private _deductCreditsUseCase = new DeductCreditsUseCase(
    this._userPackageRepository,
    this._creditUsageRepository,
    this._activityLogRepository
  );
  private _saveBusinessCardSessionUseCase = new SaveBusinessCardSessionUseCase(this._businessCardSessionRepository);
  private _getUserSessionsUseCase = new GetUserSessionsUseCase(this._businessCardSessionRepository);
  private _createBusinessCardContactUseCase = new CreateBusinessCardContactUseCase(this._businessCardContactRepository);
  private _getSessionContactsUseCase = new GetSessionContactsUseCase(this._businessCardContactRepository);
  private _updateBusinessCardContactUseCase = new UpdateBusinessCardContactUseCase(this._businessCardContactRepository);
  private _getUserCreditsUseCase = new GetUserCreditsUseCase(this._userPackageRepository);
  private _refreshUserCreditsUseCase = new RefreshUserCreditsUseCase(this._userPackageRepository);
  private _updateCreditsUseCase = new UpdateCreditsUseCase();
  private _getDailyCreditsUseCase = new GetDailyCreditsUseCase(this._dailyCreditRepository);
  private _deductDailyCreditsUseCase = new DeductDailyCreditsUseCase(this._dailyCreditRepository);
  private _resetDailyCreditsUseCase = new ResetDailyCreditsUseCase(this._dailyCreditRepository);
  private _grantDailyCreditsUseCase = new GrantDailyCreditsUseCase(this._dailyCreditRepository);
  private _grantSoftLaunchBonusUseCase = new GrantSoftLaunchBonusUseCase(this._userPackageRepository);
  private _getAllUserContactsUseCase = new GetAllUserContactsUseCase(this._businessCardContactRepository);
  private _deleteContactUseCase = new DeleteContactUseCase(this._businessCardContactRepository);
  private _createTemplateUseCase = new CreateTemplateUseCase(this._templateRepository);
  private _getUserTemplatesUseCase = new GetUserTemplatesUseCase(this._templateRepository);
  private _updateTemplateUseCase = new UpdateTemplateUseCase(this._templateRepository);
  private _deleteTemplateUseCase = new DeleteTemplateUseCase(this._templateRepository);
  private _getContactActionsUseCase = new GetContactActionsUseCase(this._contactOutreachRepository);
  private _generateOutreachPackageUseCase = new GenerateOutreachPackageUseCase(
    this._contactOutreachRepository,
    this._dailyCreditRepository,
    this._userPackageRepository
  );
  private _createCheckoutSessionUseCase = new CreateCheckoutSessionUseCase(this._paymentRepository);
  private _processPaymentWebhookUseCase = new ProcessPaymentWebhookUseCase(
    this._paymentRepository,
    this._userPackageRepository
  );
  private _getUserPackageHistoryUseCase = new GetUserPackageHistoryUseCase(this._userPackageHistoryRepository);
  private _updateUserPackageHistoryUseCase = new UpdateUserPackageHistoryUseCase(this._userPackageHistoryRepository);

  // Application Services
  private _paymentApplicationService = new PaymentApplicationService(
    this._packageRepository,
    this._userPackageRepository,
    this._paymentRepository
  );
  private _subscriptionApplicationService = new SubscriptionApplicationService(
    this._packageRepository,
    this._userPackageRepository,
    this._paymentRepository
  );
  private _creditApplicationService = new CreditApplicationService(
    this._userPackageRepository,
    this._dailyCreditRepository,
    this._updateCreditsUseCase
  );
  private _templateApplicationService = new TemplateApplicationService(this._templateRepository);
  private _businessCardApplicationService = new BusinessCardApplicationService(
    this._businessCardContactRepository,
    this._businessCardSessionRepository,
    this._templateRepository,
    this._aiProcessingRepository
  );
  private _authApplicationService = new AuthApplicationService(
    this._authRepository, 
    this._dailyCreditRepository,
    this._userPackageRepository,
    this._businessCardContactRepository
  );
  private _contactApplicationService = new ContactApplicationService(
    this._businessCardContactRepository,
    this._contactOutreachRepository,
    this._businessCardSessionRepository
  );
  private _adminApplicationService = new AdminApplicationService(
    this._userRepository,
    this._packageRepository,
    this._userPackageRepository,
    this._creditUsageRepository
  );

  // Repository getters
  get authRepository() { return this._authRepository; }
  get userRepository() { return this._userRepository; }
  get packageRepository() { return this._packageRepository; }
  get userPackageRepository() { return this._userPackageRepository; }
  get creditUsageRepository() { return this._creditUsageRepository; }
  get activityLogRepository() { return this._activityLogRepository; }
  get businessCardSessionRepository() { return this._businessCardSessionRepository; }
  get businessCardContactRepository() { return this._businessCardContactRepository; }
  get dailyCreditRepository() { return this._dailyCreditRepository; }
  get templateRepository() { return this._templateRepository; }
  get contactOutreachRepository() { return this._contactOutreachRepository; }
  get paymentRepository() { return this._paymentRepository; }
  get userPackageHistoryRepository() { return this._userPackageHistoryRepository; }
  get aiProcessingRepository() { return this._aiProcessingRepository; }

  // Use case getters
  get signUpUseCase() { return this._signUpUseCase; }
  get signInUseCase() { return this._signInUseCase; }
  get getUserPackagesUseCase() { return this._getUserPackagesUseCase; }
  get createPackageUseCase() { return this._createPackageUseCase; }
  get deductCreditsUseCase() { return this._deductCreditsUseCase; }
  get saveBusinessCardSessionUseCase() { return this._saveBusinessCardSessionUseCase; }
  get getUserSessionsUseCase() { return this._getUserSessionsUseCase; }
  get createBusinessCardContactUseCase() { return this._createBusinessCardContactUseCase; }
  get getSessionContactsUseCase() { return this._getSessionContactsUseCase; }
  get updateBusinessCardContactUseCase() { return this._updateBusinessCardContactUseCase; }
  get getUserCreditsUseCase() { return this._getUserCreditsUseCase; }
  get refreshUserCreditsUseCase() { return this._refreshUserCreditsUseCase; }
  get updateCreditsUseCase() { return this._updateCreditsUseCase; }
  get getDailyCreditsUseCase() { return this._getDailyCreditsUseCase; }
  get deductDailyCreditsUseCase() { return this._deductDailyCreditsUseCase; }
  get resetDailyCreditsUseCase() { return this._resetDailyCreditsUseCase; }
  get grantDailyCreditsUseCase() { return this._grantDailyCreditsUseCase; }
  get grantSoftLaunchBonusUseCase() { return this._grantSoftLaunchBonusUseCase; }
  get getAllUserContactsUseCase() { return this._getAllUserContactsUseCase; }
  get deleteContactUseCase() { return this._deleteContactUseCase; }
  get createTemplateUseCase() { return this._createTemplateUseCase; }
  get getUserTemplatesUseCase() { return this._getUserTemplatesUseCase; }
  get updateTemplateUseCase() { return this._updateTemplateUseCase; }
  get deleteTemplateUseCase() { return this._deleteTemplateUseCase; }
  get getContactActionsUseCase() { return this._getContactActionsUseCase; }
  get generateOutreachPackageUseCase() { return this._generateOutreachPackageUseCase; }
  get createCheckoutSessionUseCase() { return this._createCheckoutSessionUseCase; }
  get processPaymentWebhookUseCase() { return this._processPaymentWebhookUseCase; }
  get getUserPackageHistoryUseCase() { return this._getUserPackageHistoryUseCase; }
  get updateUserPackageHistoryUseCase() { return this._updateUserPackageHistoryUseCase; }

  // Application Service getters
  get paymentApplicationService() { return this._paymentApplicationService; }
  get subscriptionApplicationService() { return this._subscriptionApplicationService; }
  get creditApplicationService() { return this._creditApplicationService; }
  get templateApplicationService() { return this._templateApplicationService; }
  get businessCardApplicationService() { return this._businessCardApplicationService; }
  get authApplicationService() { return this._authApplicationService; }
  get contactApplicationService() { return this._contactApplicationService; }
  get adminApplicationService() { return this._adminApplicationService; }
}

export const container = new Container();
