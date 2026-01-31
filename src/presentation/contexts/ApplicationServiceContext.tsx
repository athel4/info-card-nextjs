'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { container } from '../../infrastructure/di/Container';
import { PaymentApplicationService } from '../../application/services/PaymentApplicationService';
import { CreditApplicationService } from '../../application/services/CreditApplicationService';
import { TemplateApplicationService } from '../../application/services/TemplateApplicationService';
import { BusinessCardApplicationService } from '../../application/services/BusinessCardApplicationService';
import { AuthApplicationService } from '../../application/services/AuthApplicationService';
import { ContactApplicationService } from '../../application/services/ContactApplicationService';
import { AdminApplicationService } from '../../application/services/AdminApplicationService';

interface ApplicationServiceContextType {
  paymentService: PaymentApplicationService;
  creditService: CreditApplicationService;
  templateService: TemplateApplicationService;
  businessCardService: BusinessCardApplicationService;
  authService: AuthApplicationService;
  contactService: ContactApplicationService;
  adminService: AdminApplicationService;
}

const ApplicationServiceContext = createContext<ApplicationServiceContextType | undefined>(undefined);

export const useApplicationServices = (): ApplicationServiceContextType => {
  const context = useContext(ApplicationServiceContext);
  if (!context) {
    throw new Error('useApplicationServices must be used within ApplicationServiceProvider');
  }
  return context;
};

export const ApplicationServiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const services: ApplicationServiceContextType = {
    paymentService: container.paymentApplicationService,
    creditService: container.creditApplicationService,
    templateService: container.templateApplicationService,
    businessCardService: container.businessCardApplicationService,
    authService: container.authApplicationService,
    contactService: container.contactApplicationService,
    adminService: container.adminApplicationService,
  };

  return (
    <ApplicationServiceContext.Provider value={services}>
      {children}
    </ApplicationServiceContext.Provider>
  );
};