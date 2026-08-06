import type { ModelStatus, ModelType } from '../../../services/ai-model-service';
import type { Tone } from '../../../components/ui/Badge';

export const MODEL_TYPES: ModelType[] = [
  'CLASSIFICATION',
  'REGRESSION',
  'OBJECT_DETECTION',
  'NLP',
  'COMPUTER_VISION',
  'RECOMMENDATION',
  'TIME_SERIES',
  'CUSTOM',
];

export const modelTypeLabel: Record<string, string> = {
  CLASSIFICATION: 'Classification',
  REGRESSION: 'Regression',
  OBJECT_DETECTION: 'Object Detection',
  NLP: 'NLP',
  COMPUTER_VISION: 'Computer Vision',
  RECOMMENDATION: 'Recommendation',
  TIME_SERIES: 'Time Series',
  CUSTOM: 'Custom',
};

export const modelTypeColor: Record<string, Tone> = {
  CLASSIFICATION: 'accent',
  REGRESSION: 'info',
  OBJECT_DETECTION: 'warning',
  NLP: 'success',
  COMPUTER_VISION: 'warning',
  RECOMMENDATION: 'info',
  TIME_SERIES: 'neutral',
  CUSTOM: 'neutral',
};

export const MODEL_STATUSES: ModelStatus[] = [
  'PLANNING',
  'TRAINING',
  'VALIDATING',
  'READY',
  'DEPLOYED',
  'RETIRED',
  'ARCHIVED',
];

export const modelStatusLabel: Record<string, string> = {
  PLANNING: 'Planning',
  TRAINING: 'Training',
  VALIDATING: 'Validating',
  READY: 'Ready',
  DEPLOYED: 'Deployed',
  RETIRED: 'Retired',
  ARCHIVED: 'Archived',
};

export const modelStatusColor: Record<string, Tone> = {
  PLANNING: 'neutral',
  TRAINING: 'warning',
  VALIDATING: 'info',
  READY: 'success',
  DEPLOYED: 'accent',
  RETIRED: 'neutral',
  ARCHIVED: 'danger',
};

export function allowedStatusTransitions(current: ModelStatus): ModelStatus[] {
  if (current === 'ARCHIVED') return [];
  if (current === 'DEPLOYED') return ['RETIRED'];
  if (current === 'RETIRED') return ['ARCHIVED'];
  return MODEL_STATUSES.filter((s) => s !== current && s !== 'ARCHIVED');
}

export function canArchiveModel(status: ModelStatus): boolean {
  return status !== 'ARCHIVED';
}
