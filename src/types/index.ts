export interface Settings {
  jiraEmail: string;
  jiraToken: string;
  jiraBaseUrl: string;
  groqApiKey: string;
  groqModel: string;
}

export interface JiraTicket {
  key: string;
  fields: {
    summary: string;
    description: unknown;
    issuetype: { name: string };
    status: { name: string };
    priority: { name: string } | null;
    assignee: { displayName: string } | null;
    labels: string[];
    components: Array<{ name: string }>;
  };
}

export interface SchedulePhase {
  phase: string;
  activities: string;
}

export interface TestStrategy {
  objective: string;
  scope: {
    inScope: string[];
    outOfScope: string[];
  };
  focusAreas: string[];
  approach: string[];
  deliverables: string[];
  teamAndSchedule: {
    teamSize: string;
    duration: string;
    schedule: SchedulePhase[];
  };
  entryExitCriteria: {
    entryCriteria: string[];
    exitCriteria: string[];
  };
  risks: string[];
}

export interface GeneratedStrategy {
  ticketId: string;
  ticketSummary: string;
  generatedAt: string;
  strategy: TestStrategy;
}

export type LoadingState = 'idle' | 'fetching-jira' | 'generating' | 'done' | 'error';
