
export interface User {
  id: string;
  email: string;
  fullName?: string;
  role: 'end_user' | 'admin';
  stripeAccId?: string;
  createdAt: Date;
  updatedAt: Date;
}
