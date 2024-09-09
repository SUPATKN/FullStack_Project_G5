export default interface File {
  url: string;
  name: string;
}

// types.ts
export interface Slip {
  slip_id: number;
  user_id: number;
  amount: number;
  coins: number;
  slip_path: string;
  status: string;
  created_at: Date;
  updated_at: Date;
  admin_note: string | null;
  order_id?: number; // Optional if it might not always be present
}
