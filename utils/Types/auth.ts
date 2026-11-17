import type { User } from "./common";

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * The account exists but its email is not confirmed yet: a 6-digit code was
 * emailed (`emailSent` is false when the mail server refused it, and the
 * customer should press "resend").
 */
export interface PendingVerification {
  email: string;
  emailSent: boolean;
}

/**
 * Thrown by `login` when the password is right but the email was never
 * confirmed. The API has just emailed a fresh code, so the login page shows
 * the code screen instead of an error.
 */
export class EmailNotVerifiedError extends Error {
  pending: PendingVerification;

  constructor(message: string, pending: PendingVerification) {
    super(message);
    this.name = "EmailNotVerifiedError";
    this.pending = pending;
  }
}

export interface AuthContextType {
  state: AuthState;
  /** Throws EmailNotVerifiedError when the email still needs its code. */
  login: (email: string, password: string) => Promise<void>;
  /** Creates the account; it is usable once the emailed code is verified. */
  register: (name: string, email: string, phone: string, password: string) => Promise<PendingVerification>;
  /** Verifies the emailed code and signs the customer in. */
  verifyEmail: (email: string, code: string) => Promise<void>;
  /** Emails a new code; resolves to whether it actually went out. */
  resendVerificationCode: (email: string) => Promise<boolean>;
  loginWithGoogle: (googleToken: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}
