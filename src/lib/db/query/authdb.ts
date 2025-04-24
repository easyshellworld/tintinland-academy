// src/lib/db/query/authdb.ts
import db from '../index';

type AuthResult = {
  success: boolean;
  role?: string;
  id?:string;
  
};

export function checkWalletAuth(walletAddress: string): AuthResult {

  const staff = db.prepare('SELECT role,id FROM staff WHERE wallet_address = ?').get(walletAddress) as { role: string,id:number } | undefined;
 
      if (staff) {
       return { success: true, role: staff.role,id:String(staff.id)};
      }

  const student = db.prepare('SELECT approved,student_id FROM registrations WHERE wallet_address = ?').get(walletAddress)  as { approved: number,student_id:string } | undefined;
 
  if (student) {
    if(student.approved===1){
      return { success: true, role: "student",id:student.student_id};
    }else if(student.approved===0){
      return { success: true, role: "pending" };
    }
    
  }

  return { success: false };
}
