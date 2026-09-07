import { prisma } from '@/lib/prisma';
import { AuditLogItem, AIGovernanceTelemetry } from '@/types/classroom';

export class AuditService {
  /**
   * Record a security / compliance audit event
   */
  static async logAction(params: {
    userId?: string | null;
    action: string;
    entity: string;
    entityId?: string | null;
    oldValue?: string | null;
    newValue?: string | null;
    ipHash?: string | null;
  }) {
    try {
      return await prisma.auditLog.create({
        data: {
          user_id: params.userId,
          action: params.action,
          entity: params.entity,
          entity_id: params.entityId,
          old_value: params.oldValue,
          new_value: params.newValue,
          ip_hash: params.ipHash,
        },
      });
    } catch (e) {
      console.error('Failed to write audit log:', e);
      return null;
    }
  }

  /**
   * Fetch recent audit logs with user information
   */
  static async getRecentLogs(limit = 50): Promise<AuditLogItem[]> {
    const logs = await prisma.auditLog.findMany({
      take: limit,
      orderBy: { timestamp: 'desc' },
    });

    const userIds = [...new Set(logs.map((l) => l.user_id).filter(Boolean))] as string[];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u.name]));

    return logs.map((log) => ({
      id: log.id,
      userId: log.user_id,
      userName: log.user_id ? userMap.get(log.user_id) || 'Unknown User' : 'System',
      action: log.action,
      entity: log.entity,
      entityId: log.entity_id,
      oldValue: log.old_value,
      newValue: log.new_value,
      timestamp: log.timestamp.toISOString(),
    }));
  }

  /**
   * Record AI Governance Telemetry event
   */
  static async logAIOperation(params: {
    userId?: string | null;
    engineType: string;
    promptVersion?: string;
    modelVersion?: string;
    inputTokens?: number;
    outputTokens?: number;
    latencyMs?: number;
  }) {
    try {
      return await prisma.aIGovernanceLog.create({
        data: {
          user_id: params.userId,
          engine_type: params.engineType,
          prompt_version: params.promptVersion || 'v2.1',
          model_version: params.modelVersion || 'gemini-2.5-flash',
          input_tokens: params.inputTokens || 0,
          output_tokens: params.outputTokens || 0,
          latency_ms: params.latencyMs || 0,
        },
      });
    } catch (e) {
      console.error('Failed to write AI governance log:', e);
      return null;
    }
  }

  /**
   * Aggregate AI Governance Telemetry statistics
   */
  static async getAITelemetry(): Promise<AIGovernanceTelemetry> {
    const logs = await prisma.aIGovernanceLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 200,
    });

    if (logs.length === 0) {
      return {
        totalCalls: 0,
        totalTokens: 0,
        avgLatencyMs: 0,
        activePromptVersion: 'v2.1',
        activeModelVersion: 'gemini-2.5-flash',
        engineBreakdown: {},
      };
    }

    const totalCalls = logs.length;
    let totalTokens = 0;
    let totalLatency = 0;
    const engineBreakdown: Record<string, number> = {};

    for (const log of logs) {
      totalTokens += log.input_tokens + log.output_tokens;
      totalLatency += log.latency_ms;
      engineBreakdown[log.engine_type] = (engineBreakdown[log.engine_type] || 0) + 1;
    }

    return {
      totalCalls,
      totalTokens,
      avgLatencyMs: Math.round(totalLatency / totalCalls),
      activePromptVersion: logs[0]?.prompt_version || 'v2.1',
      activeModelVersion: logs[0]?.model_version || 'gemini-2.5-flash',
      engineBreakdown,
    };
  }
}
