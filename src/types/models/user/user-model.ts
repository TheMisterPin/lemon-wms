export interface API_User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export type User = Pick<API_User, 'id' | 'name'>;

export type AuthUser = Pick<API_User, 'id' | 'email' | 'password'>;
