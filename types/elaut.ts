export type Publication = {
  id: number
  pub_full_name: string
  pub_short_name: string
  description: string
  subject: string
  doc_type: string
  pub_file: string
  pub_file_type: string
  slug: string
  language: string
  access_count: number
  tanggal_count: number
  source: string
  created_at: string // ISO 8601 date-time string
  updated_at: string // ISO 8601 date-time string
}

export type PublicationList = Publication[]
