import axios from 'axios';

export function createApiClient(baseUrl: string, apiKey: string) {
  return axios.create({
    baseURL: `${baseUrl.replace(/\/$/, '')}/`,
    timeout: 10_000,
    headers: {
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json',
    },
  });
}
