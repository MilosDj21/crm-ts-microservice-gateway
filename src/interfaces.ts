export interface User {
  id?: number;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  roles?: Array<number>;
  profileImage?: string;
}
