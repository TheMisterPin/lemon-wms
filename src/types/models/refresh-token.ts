export interface IRefreshToken {
  id: string
  userId: string
  tokenHash: string
  deviceLabel: string
  deviceId: string | null
  expiresAt: Date
  revokedAt: Date | null
  createdAt: Date
}
