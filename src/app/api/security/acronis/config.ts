export const ACRONIS_API_CONFIG = {
  BASE_URL: process.env.ACRONIS_BASE_URL || 'https://uk01-cloud.acronis.com',
  CLIENT_ID: process.env.ACRONIS_CLIENT_ID,
  CLIENT_SECRET: process.env.ACRONIS_CLIENT_SECRET,
  ENDPOINTS: {
    AUTH: '/api/2/idp/token',
    ALERTS: '/api/alert_manager/v1/alerts',
    AGENTS: '/api/agent_manager/v2/agents',
    TASKS: '/api/task_manager/v2/tasks',
    POLICIES: '/api/policy_manager/v4/policies',
    BACKUPS: '/api/backup_manager/v2/backups',
    TENANTS: '/api/2/tenants',
    TENANT_CHILDREN: '/api/2/tenants/{tenant_id}/children',
    TENANT_ACTIVATE: '/api/2/tenants/{tenant_id}/activate',
    TENANT_STATUS: '/api/2/tenants/{tenant_id}/status',
    ISOLATE_ENDPOINT: '/api/agent_manager/v2/agents/{agent_id}/actions/isolate',
    RESTORE_ENDPOINT: '/api/agent_manager/v2/agents/{agent_id}/actions/restore',
    ISOLATION_STATUS: '/api/agent_manager/v2/agents/{agent_id}/isolation_status',
    USER_ENDPOINTS: '/api/agent_manager/v2/agents?tenant_id={tenant_id}',
    ENDPOINT_DETAILS: '/api/agent_manager/v2/agents/{agent_id}',
    ENDPOINT_REGISTER: '/api/agent_manager/v2/agents/register',
    ENDPOINT_UNREGISTER: '/api/agent_manager/v2/agents/{agent_id}/unregister'
  }
}; 