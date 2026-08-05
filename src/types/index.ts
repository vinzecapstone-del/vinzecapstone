// ─── User & Auth ───────────────────────────────────────────────────────────────

export type UserRole = 'resident' | 'staff'

export interface Profile {
  id: string
  full_name: string
  email?: string
  resident_id?: string
  birthdate?: string
  purok?: string
  contact_number?: string
  address?: string
  role: UserRole
  created_at: string
  house_type?: string
  is_pwd?: boolean
  is_senior?: boolean
  government_beneficiary?: string
  with_electricity?: boolean
  with_bathroom?: boolean
  monthly_income?: string
  occupation?: string
  educational_attainment?: string
  valid_id_url?: string
}

// ─── Puroks ────────────────────────────────────────────────────────────────────

export const PUROK_LIST = [
  'Ipil',
  'Suwa',
  'Lusod',
  'Centro Lonos',
  'Ilaya',
  'Parayan',
  'Babangtan',
] as const

export type Purok = typeof PUROK_LIST[number]

// ─── Certificates ──────────────────────────────────────────────────────────────

export type CertificateType =
  | 'clearance'
  | 'indigency'
  | 'residency'
  | 'business_clearance'
  | 'tree_cutting'
  | 'cedula'

export const CERTIFICATE_LABELS: Record<CertificateType, string> = {
  clearance: 'Barangay Clearance',
  indigency: 'Certificate of Indigency',
  residency: 'Certificate of Residency',
  business_clearance: 'Business Clearance',
  tree_cutting: 'Tree Cutting Permit',
  cedula: 'Community Tax Certificate (Cedula)',
}

export const CERTIFICATE_DESCRIPTIONS: Record<CertificateType, string> = {
  clearance: 'Certifies that a resident has no derogatory record in the barangay.',
  indigency: 'Certifies that a resident belongs to an indigent family.',
  residency: 'Certifies that a person is a legitimate resident of the barangay.',
  business_clearance: 'Certifies that a business is permitted to operate within the barangay.',
  tree_cutting: 'Grants permission to cut trees within the barangay jurisdiction.',
  cedula: 'Official community tax certificate required for various government transactions.',
}

// ─── Cedula Civil Status ───────────────────────────────────────────────────────

export const CIVIL_STATUS_LIST = [
  'Single',
  'Married',
  'Widowed',
  'Separated',
  'Annulled',
] as const

export type CivilStatus = typeof CIVIL_STATUS_LIST[number]

// ─── Requests ──────────────────────────────────────────────────────────────────

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'ready' | 'picked_up'

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  ready: 'Ready for Pickup',
  picked_up: 'Picked Up',
}

export const REQUEST_STATUS_COLORS: Record<RequestStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-blue-100 text-blue-800 border-blue-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  ready: 'bg-green-100 text-green-800 border-green-200',
  picked_up: 'bg-blue-100 text-blue-800 border-blue-200',
}

export type RequestPurpose =
  | 'Employment'
  | 'Business Permit'
  | 'School Requirement'
  | 'Government ID'
  | 'Loan Application'
  | 'Travel / Visa'
  | 'Court Requirement'
  | 'Senior Citizen Benefit'
  | 'Medical Assistance'
  | 'Business Operation'
  | 'Tree Removal'
  | 'Construction'
  | 'Community Tax'
  | 'Other'

export const REQUEST_PURPOSES: RequestPurpose[] = [
  'Employment',
  'Business Permit',
  'School Requirement',
  'Government ID',
  'Loan Application',
  'Travel / Visa',
  'Court Requirement',
  'Senior Citizen Benefit',
  'Medical Assistance',
  'Business Operation',
  'Tree Removal',
  'Construction',
  'Community Tax',
  'Other',
]

export interface CertificateRequest {
  id: string
  tracking_number: string
  user_id: string
  certificate_type: CertificateType
  purpose: string
  status: RequestStatus
  rejection_reason?: string
  certificate_html?: string
  certificate_generated_at?: string
  amount: number
  payment_status: PaymentStatus
  payment_method?: PaymentMethod
  reference_number?: string
  id_document_url?: string
  // personal
  applicant_name?: string
  applicant_birthdate?: string
  applicant_purok?: string
  applicant_address?: string
  applicant_contact?: string
  // business clearance
  business_name?: string
  business_address?: string
  business_type?: string
  // tree cutting
  tree_species?: string
  tree_count?: string
  tree_location?: string
  tree_reason?: string
  // cedula
  cedula_civil_status?: string
  cedula_occupation?: string
  cedula_gross_income?: string
  cedula_tin?: string
  picked_up_at?: string
  created_at: string
  updated_at: string
  profiles?: Pick<Profile, 'id' | 'full_name' | 'email' | 'resident_id' | 'purok' | 'contact_number'>
}

// ─── Payments ──────────────────────────────────────────────────────────────────

export type PaymentStatus = 'unpaid' | 'paid'

export type PaymentMethod = 'over-the-counter' | 'digital'

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  'over-the-counter': 'Over the Counter',
  'digital': 'Digital Payment (GCash / Maya)',
}

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  unpaid: 'bg-orange-100 text-orange-800 border-orange-200',
  paid: 'bg-green-100 text-green-800 border-green-200',
}

// ─── Announcements ─────────────────────────────────────────────────────────────

export interface Announcement {
  id: string
  title: string
  content: string
  author_id: string
  created_at: string
  profiles?: Pick<Profile, 'full_name'>
}

// ─── Audit Logs ────────────────────────────────────────────────────────────────

export type AuditAction =
  | 'APPROVED_REQUEST'
  | 'REJECTED_REQUEST'
  | 'MARKED_READY'
  | 'UPDATED_SETTINGS'
  | 'CREATED_ANNOUNCEMENT'
  | 'DELETED_ANNOUNCEMENT'
  | 'UPDATED_RESIDENT'
  | 'GENERATED_CERTIFICATE'

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  APPROVED_REQUEST: 'Approved a certificate request',
  REJECTED_REQUEST: 'Rejected a certificate request',
  MARKED_READY: 'Marked certificate as ready for pickup',
  UPDATED_SETTINGS: 'Updated system settings',
  CREATED_ANNOUNCEMENT: 'Created a new announcement',
  DELETED_ANNOUNCEMENT: 'Deleted an announcement',
  UPDATED_RESIDENT: 'Updated resident information',
  GENERATED_CERTIFICATE: 'Generated a certificate document',
}

export interface AuditLog {
  id: string
  staff_id: string
  staff_name: string
  action: AuditAction | string
  target_id?: string
  details?: string
  created_at: string
}

// ─── System Settings ───────────────────────────────────────────────────────────

export interface SystemSettings {
  id: string
  captain_name: string
  barangay_name: string
  clearance_fee: number
  indigency_fee: number
  residency_fee: number
  business_clearance_fee: number
  tree_cutting_fee: number
  cedula_fee: number
  updated_at: string
}

// ─── Certificate Templates ─────────────────────────────────────────────────────

export interface CertificateTemplateData {
  tracking_number: string
  certificate_type: CertificateType
  purpose: string
  issued_date: string
  full_name: string
  birthdate?: string
  purok?: string
  address?: string
  captain_name: string
  barangay_name: string
  amount: number
}

// ─── Dashboard Stats ───────────────────────────────────────────────────────────

export interface DashboardStats {
  total_requests: number
  pending_requests: number
  approved_requests: number
  ready_requests: number
  rejected_requests: number
  total_revenue: number
}

export interface ChartDataPoint {
  label: string
  clearance: number
  indigency: number
  residency: number
  business_clearance: number
  tree_cutting: number
  cedula: number
  total: number
}

// ─── Form Types ────────────────────────────────────────────────────────────────

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  full_name: string
  email: string
  password: string
  confirm_password: string
  birthdate: string
  purok: string
}

export interface RequestFormData {
  certificate_type: CertificateType
  purpose: string
  id_document?: File
}

export interface ProfileFormData {
  full_name: string
  contact_number: string
  address: string
  purok: string
}

export interface ChangePasswordFormData {
  current_password: string
  new_password: string
  confirm_password: string
}

// ─── API Response wrapper ──────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  success: boolean
}
