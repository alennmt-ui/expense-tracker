import { apiRequest } from './client';

interface SettingsResponse {
  settings: {
    currency: string;
    reset_day: string;
    passive_rule: string;
  };
}

interface SettingsPayload {
  currency: string;
  reset_day: string;
  passive_rule: string;
}

export async function getSettings(): Promise<SettingsResponse> {
  return apiRequest<SettingsResponse>('/settings');
}

export async function updateSettings(settings: SettingsPayload): Promise<SettingsResponse> {
  return apiRequest<SettingsResponse>('/settings', {
    method: 'POST',
    body: JSON.stringify({ settings }),
  });
}
