// ===== Auth Types =====

export interface User {
  id: string
  email: string
  username: string
  fullName: string
  avatarUrl: string | null
  role: 'admin' | 'researcher' | 'viewer'
  preferences: UserPreferences
  createdAt: string
  updatedAt: string
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system'
  defaultExecutionSpeed: number
  defaultEnvironment: string | null
  notifications: boolean
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: 'Bearer'
}

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterRequest {
  email: string
  username: string
  fullName: string
  password: string
  confirmPassword: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
  confirmPassword: string
}

// ===== Environment Types =====

export interface EnvironmentNode {
  id: string
  position: [number, number, number]
  neighborIds: string[]
  imageUrl: string
  depthUrl?: string
  semanticUrl?: string
  metadata: Record<string, string | number | boolean>
}

export interface EnvironmentEdge {
  fromId: string
  toId: string
  distance: number
  heading: number
  elevation: number
}

export interface Environment {
  id: string
  name: string
  description: string
  language: string
  nodeCount: number
  edgeCount: number
  nodes: EnvironmentNode[]
  edges: EnvironmentEdge[]
  startNodeId: string
  goalNodeIds: string[]
  thumbnailUrl: string | null
  metadata: Record<string, string | number | boolean>
  createdAt: string
  updatedAt: string
}

// ===== Action Types =====

export enum ActionType {
  FORWARD = 'FORWARD',
  TURN_LEFT = 'TURN_LEFT',
  TURN_RIGHT = 'TURN_RIGHT',
  TURN_AROUND = 'TURN_AROUND',
  STOP = 'STOP',
  LOOK_LEFT = 'LOOK_LEFT',
  LOOK_RIGHT = 'LOOK_RIGHT',
  LOOK_UP = 'LOOK_UP',
  LOOK_DOWN = 'LOOK_DOWN',
}

export interface Action {
  type: ActionType
  targetNodeId?: string
  confidence: number
  reasoning: string
  timestamp: string
}

export interface CandidateAction {
  id: string
  action: Action
  score: number
  visualFeatures: string[]
  linguisticAlignment: number
  spatialValidity: boolean
  selected: boolean
}

// ===== Spatial / Language Types =====

export interface SpatialConstraint {
  type: 'PROXIMITY' | 'DIRECTION' | 'LANDMARK' | 'SEQUENCE'
  description: string
  nodeIds: string[]
  satisfied: boolean
  confidence: number
}

export interface ParsedInstruction {
  originalText: string
  language: string
  detectedLanguage: string
  segments: InstructionSegment[]
  spatialConstraints: SpatialConstraint[]
  landmarks: string[]
  actions: ActionType[]
  confidence: number
  translationUsed: boolean
}

export interface InstructionSegment {
  id: string
  text: string
  type: 'action' | 'landmark' | 'direction' | 'modifier'
  startIndex: number
  endIndex: number
  resolved: boolean
}

// ===== Uncertainty Types =====

export enum UncertaintyLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface UncertaintyReport {
  level: UncertaintyLevel
  score: number
  reasons: string[]
  visualAmbiguity: number
  linguisticAmbiguity: number
  spatialAmbiguity: number
  candidateCount: number
  recommendedAction: 'PROCEED' | 'PAUSE' | 'REQUEST_CLARIFICATION' | 'BACKTRACK'
}

// ===== Navigation Types =====

export enum NavigationStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  STOPPED = 'STOPPED',
}

export interface AgentState {
  currentNodeId: string
  heading: number
  elevation: number
  visitedNodeIds: string[]
  stepCount: number
  confidence: number
  attentionMap: number[][]
  features: Record<string, number[]>
}

export interface NavigationState {
  runId: string
  status: NavigationStatus
  agentState: AgentState
  currentInstruction: string
  parsedInstruction: ParsedInstruction | null
  uncertainty: UncertaintyReport | null
  candidates: CandidateAction[]
  stepsCompleted: number
  maxSteps: number
  startTime: string
  endTime: string | null
  successRate: number | null
}

export interface NavigationRun {
  id: string
  userId: string
  environmentId: string
  environment: Environment
  instruction: string
  language: string
  status: NavigationStatus
  agentVersion: string
  config: NavigationConfig
  state: NavigationState
  metrics: NavigationMetrics | null
  createdAt: string
  updatedAt: string
}

export interface NavigationConfig {
  maxSteps: number
  executionSpeed: number
  autoStep: boolean
  language: string
  agentVersion: string
  uncertaintyThreshold: number
  enableIntervention: boolean
  enableBacktracking: boolean
}

export interface NavigationStepResponse {
  success: boolean
  stepNumber: number
  action: Action
  newState: NavigationState
  uncertainty: UncertaintyReport
  candidates: CandidateAction[]
  reachedGoal: boolean
  message: string
}

// ===== WebSocket Types =====

export type WebSocketEventType =
  | 'NAVIGATION_STARTED'
  | 'STEP_COMPLETED'
  | 'NAVIGATION_PAUSED'
  | 'NAVIGATION_RESUMED'
  | 'NAVIGATION_STOPPED'
  | 'NAVIGATION_COMPLETED'
  | 'NAVIGATION_FAILED'
  | 'UNCERTAINTY_HIGH'
  | 'INTERVENTION_REQUIRED'
  | 'AGENT_STATE_UPDATE'
  | 'ERROR'

export interface WebSocketEvent {
  type: WebSocketEventType
  runId: string
  timestamp: string
  data: NavigationState | NavigationStepResponse | UncertaintyReport | AgentState | ErrorEvent
  meta?: Record<string, string | number | boolean>
}

export interface ErrorEvent {
  code: string
  message: string
  details?: string
}

// ===== Analytics Types =====

export interface NavigationMetrics {
  runId: string
  successRate: number
  averageSteps: number
  totalDistance: number
  taskCompletionTime: number
  oracle: number
  clsScore: number
  ndtwScore: number
  spScore: number
  stepAccuracy: number
  stoppingAccuracy: number
}

export interface LanguageMetrics {
  language: string
  languageName: string
  totalRuns: number
  successRate: number
  averageSteps: number
  averageCls: number
  avgInstructionLength: number
  uniqueUsers: number
}

export interface EnvironmentMetrics {
  environmentId: string
  environmentName: string
  totalRuns: number
  successRate: number
  averageSteps: number
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface AnalyticsOverview {
  totalRuns: number
  successRate: number
  totalUsers: number
  totalEnvironments: number
  averageSteps: number
  languageDistribution: Record<string, number>
  recentActivity: ActivityItem[]
  topLanguages: LanguageMetrics[]
  performanceTrend: TrendPoint[]
}

export interface ActivityItem {
  id: string
  userId: string
  username: string
  action: string
  environmentId: string
  environmentName: string
  timestamp: string
  success: boolean
}

export interface TrendPoint {
  date: string
  successRate: number
  totalRuns: number
  averageSteps: number
}

// ===== History Types =====

export interface HistoryItem {
  id: string
  userId: string
  username: string
  environmentId: string
  environmentName: string
  instruction: string
  language: string
  status: NavigationStatus
  stepsCompleted: number
  successRate: number | null
  duration: number | null
  createdAt: string
}

export interface ReplayFrame {
  frameIndex: number
  nodeId: string
  heading: number
  action: Action | null
  timestamp: string
  imageUrl: string
  attentionMap: number[][]
}

// ===== Experiment Types =====

export enum ExperimentStatus {
  DRAFT = 'DRAFT',
  QUEUED = 'QUEUED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface Experiment {
  id: string
  name: string
  description: string
  userId: string
  status: ExperimentStatus
  config: ExperimentConfig
  results: ExperimentResult | null
  createdAt: string
  updatedAt: string
  startedAt: string | null
  completedAt: string | null
}

export interface ExperimentConfig {
  environments: string[]
  languages: string[]
  instructions: string[]
  agentVersions: string[]
  runsPerCondition: number
  maxSteps: number
  randomSeed: number
}

export interface ExperimentResult {
  experimentId: string
  totalRuns: number
  completedRuns: number
  overallSuccessRate: number
  byLanguage: Record<string, NavigationMetrics>
  byEnvironment: Record<string, NavigationMetrics>
  byAgentVersion: Record<string, NavigationMetrics>
  statisticalSignificance: number
  summary: string
  generatedAt: string
}

// ===== Pagination / API Wrapper Types =====

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiError {
  status: number
  code: string
  message: string
  details?: Record<string, string>
}

// ===== Aliases and Extension Types for Stores & Hooks =====

export interface WSMessage {
  type: string
  payload: any
  timestamp?: number
}

export interface AgentObservation {
  nodeId: string
  heading: number
  landmarks: string[]
  roomType?: string
  description?: string
  step: number
  viewpointEmbeddings?: number[][]
}

export interface EvaluationMetrics {
  successRate: number
  spl: number
  navigationError: number
  ndtw: number
  sdtw: number
  pathLength: number
  steps: number
}

export interface TrajectoryStep {
  step: number
  nodeId: string
  action: string
  confidence: number
  uncertainty?: number
  timestamp?: number
}

export interface AgentAction {
  type: string
  targetNodeId?: string
  directionChange?: number
  description?: string
  score?: number
}

export interface NavigationEpisode {
  id: string
  environmentId: string
  instruction: string
  language: string
  startNodeId: string
  goalNodeId: string
  status: string
  steps?: TrajectoryStep[]
}

