export interface ICurrentUser {
  uid: string;
  email: string;
  role: 'agent' | 'admin';
}