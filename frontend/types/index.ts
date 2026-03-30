export interface Tournament {
  id: string
  slug: string
  name: string
  description: string | null
  rulesPdfUrl: string | null
  bannerUrl: string | null
  registrationOpenAt: string | null
  registrationCloseAt: string | null
  isActive: boolean
  registrationStatus?: 'UPCOMING' | 'OPEN' | 'CLOSED'
}

export type TeamStatus = 'PENDING' | 'SUCCESS' | 'FAILED'

export interface PublicTeamPlayer {
  name: string
  role: 'CAPTAIN' | 'STARTER' | 'SUBSTITUTE'
}

export interface PublicTeam {
  teamName: string
  status: TeamStatus
  players: PublicTeamPlayer[]
}

export interface Player {
  id: string
  name: string
  phone: string
  nationalId?: string
  role: 'CAPTAIN' | 'STARTER' | 'SUBSTITUTE'
  sortOrder: number
}

export interface AdminTeam {
  id: string
  teamName: string
  status: TeamStatus
  paymentNote: string | null
  rejectionReason: string | null
  submittedAt: string
  reviewedAt: string | null
  players: Player[]
  tournament?: { name: string; slug: string }
}

export interface RegisterPlayerInput {
  name: string
  phone: string
  nationalId: string
  role: 'CAPTAIN' | 'STARTER' | 'SUBSTITUTE'
}

export interface RegisterTeamInput {
  teamName: string
  paymentNote?: string
  players: RegisterPlayerInput[]
}
