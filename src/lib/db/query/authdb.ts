// src/lib/db/query/authdb.ts
import db from '../index';

type AuthResult = {
  success: boolean;
  role?: string;
};

export function checkWalletAuth(walletAddress: string): AuthResult {
  const staff = db.prepare('SELECT role FROM staff WHERE wallet_address = ?').get(walletAddress) as { role: string } | undefined;

  if (staff) {
    return { success: true, role: staff.role };
  }

  const student = db.prepare('SELECT role FROM registrations WHERE wallet_address = ?').get(walletAddress) ;

  if (student) {
    return { success: true, role: "student" };
  }

  return { success: false };
}
