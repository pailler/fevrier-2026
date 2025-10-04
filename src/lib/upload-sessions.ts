// Stockage partagé des sessions d'upload (en production, utiliser Redis ou une DB)
export const uploadSessions = new Map();

export interface UploadSession {
  sessionId: string;
  filename: string;
  size: number;
  type: string;
  chunks: Map<number, { data: Buffer; index: number; size: number }>;
  createdAt: Date;
  totalChunks: number;
}























