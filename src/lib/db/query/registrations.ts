import db from '@/lib/db';

export interface Registration {
  student_name: string;
  wechat_id: string;
  phone: string;
  email: string;
  gender: string;
  age_group: string;
  education: string;
  university: string;
  major: string;
  city: string;
  role: string;
  languages: string;
  experience: string;
  source: string;
  has_web3_experience: boolean;
  study_time: string;
  interests: string;
  platforms: string;
  willing_to_hackathon: boolean;
  willing_to_lead: boolean;
  wants_private_service: boolean;
  referrer: string;
  wallet_address: string;
  student_id?: string;
  approved?: boolean;
}

export function addRegistration(reg: Omit<Registration, 'student_id'>) {
  // 查询当前最大 student_id（转为整数）
  const result = db.prepare(
    `SELECT MAX(CAST(student_id AS INTEGER)) as maxId FROM registrations WHERE student_id GLOB '[0-9]*'`
  ).get() as { maxId: string | null };

  const initialStudentId=process.env.INITIAL_STUDENT_ID || "1799"

  const maxId = result?.maxId ?? initialStudentId; // 如果没有记录就从 1799 开始（下一条是 1800）
  const nextId = parseInt(maxId, 10)  + 1;
  const formattedId = nextId.toString().padStart(4, '0'); // 确保4位格式

  const stmt = db.prepare(
    `INSERT INTO registrations (
      student_name, wechat_id, phone, email, gender, age_group, education,
      university, major, city, role, languages, experience, source,
      has_web3_experience, study_time, interests, platforms,
      willing_to_hackathon, willing_to_lead, wants_private_service,
      referrer, wallet_address, student_id, approved
    ) VALUES (
      @student_name, @wechat_id, @phone, @email, @gender, @age_group, @education,
      @university, @major, @city, @role, @languages, @experience, @source,
      @has_web3_experience, @study_time, @interests, @platforms,
      @willing_to_hackathon, @willing_to_lead, @wants_private_service,
      @referrer, @wallet_address, @student_id, @approved
    )`
  );

  const params = {
    ...reg,
    student_id: formattedId, // 自动生成的 student_id
    has_web3_experience: reg.has_web3_experience ? 1 : 0,
    willing_to_hackathon: reg.willing_to_hackathon ? 1 : 0,
    willing_to_lead: reg.willing_to_lead ? 1 : 0,
    wants_private_service: reg.wants_private_service ? 1 : 0,
    approved: reg.approved ? 1 : (reg.approved === false ? 0 : undefined),
  };

  stmt.run(params);
}
