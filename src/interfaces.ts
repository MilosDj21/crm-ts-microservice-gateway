export interface User {
  id?: number;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  roles?: Array<number>;
  profileImage?: string;
  secret?: string;
}

export interface Ticket {
  id?: number;
  title?: string;
  status?: string;
  category?: string;
  user?: number;
  seenByAdmin?: boolean;
}
