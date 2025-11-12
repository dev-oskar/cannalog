export interface Session {
  session_id: string;
  strain_used: string;
  created_by: string;
  created_at: string;
  usage_method: string;
  amount: number;
  notes?: string;
  effects?: string[];
}

export interface Strain {
  id: string;
  name: string;
  thc_content: number; // THC content in mg (e.g., 18% = 180mg)
  cbd_content: number; // CBD content in mg (e.g., 0.2% = 20mg)
  description: string;
  is_public: boolean;
  created_by: string;
  created_at: string;
  tags: string[];
  img_path: string;
}
