/**
 * The Odds API v4 Client
 * Documentation: https://the-odds-api.com/liveapi/guides/v4/
 */

const BASE_URL = 'https://api.the-odds-api.com/v4';

export interface OddsApiConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface ApiResponse<T> {
  data: T;
  headers: {
    requestsRemaining: number;
    requestsUsed: number;
    requestsLast: number;
  };
}

export interface Sport {
  key: string;
  group: string;
  title: string;
  description: string;
  active: boolean;
  has_outrights: boolean;
}

export interface Event {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers?: Bookmaker[];
}

export interface Bookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: Market[];
}

export interface Market {
  key: string;
  last_update: string;
  outcomes: Outcome[];
}

export interface Outcome {
  name: string;
  price: number;
  point?: number;
}

export interface Score {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  completed: boolean;
  home_team: string;
  away_team: string;
  scores: TeamScore[] | null;
  last_update: string | null;
}

export interface TeamScore {
  name: string;
  score: string;
}

export class TheOddsApiClient {
  private config: OddsApiConfig;
  private requestCount = 0;

  constructor(config: OddsApiConfig) {
    this.config = {
      baseUrl: BASE_URL,
      ...config,
    };
  }

  /**
   * Extract API usage headers from response
   */
  private extractHeaders(response: Response) {
    return {
      requestsRemaining: parseInt(response.headers.get('x-requests-remaining') || '0'),
      requestsUsed: parseInt(response.headers.get('x-requests-used') || '0'),
      requestsLast: parseInt(response.headers.get('x-requests-last') || '0'),
    };
  }

  /**
   * Make HTTP request with retry logic
   */
  private async request<T>(
    endpoint: string,
    params: Record<string, string> = {}
  ): Promise<ApiResponse<T>> {
    const url = new URL(`${this.config.baseUrl}${endpoint}`);
    url.searchParams.append('apiKey', this.config.apiKey);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });

    this.requestCount++;
    console.log(`[TheOddsAPI] Request #${this.requestCount}: ${endpoint}`);

    let retries = 3;
    let delay = 1000;

    while (retries > 0) {
      try {
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        const headers = this.extractHeaders(response);

        // Rate limit hit
        if (response.status === 429) {
          console.warn(`[TheOddsAPI] Rate limit hit, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
          retries--;
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        console.log(`[TheOddsAPI] Success - Credits used: ${headers.requestsLast}, Remaining: ${headers.requestsRemaining}`);

        return {
          data,
          headers,
        };
      } catch (error) {
        if (retries === 1) {
          throw error;
        }
        console.warn(`[TheOddsAPI] Request failed, retrying... (${retries - 1} left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        retries--;
        delay *= 2;
      }
    }

    throw new Error('Max retries exceeded');
  }

  /**
   * Get list of available sports
   * Cost: 0 credits (free)
   */
  async getSports(): Promise<ApiResponse<Sport[]>> {
    return this.request<Sport[]>('/sports');
  }

  /**
   * Get events for a specific sport
   * Cost: 0 credits (free)
   */
  async getEvents(sportKey: string, params?: {
    commenceTimeFrom?: string;
    commenceTimeTo?: string;
  }): Promise<ApiResponse<Event[]>> {
    return this.request<Event[]>(`/sports/${sportKey}/events`, params as Record<string, string>);
  }

  /**
   * Get odds for a specific sport
   * Cost: [markets] × [regions] credits
   */
  async getOdds(sportKey: string, params: {
    regions: string;
    markets: string;
    bookmakers?: string;
    eventIds?: string;
    commenceTimeFrom?: string;
    commenceTimeTo?: string;
    oddsFormat?: 'decimal' | 'american';
    dateFormat?: 'iso' | 'unix';
  }): Promise<ApiResponse<Event[]>> {
    return this.request<Event[]>(`/sports/${sportKey}/odds`, params as Record<string, string>);
  }

  /**
   * Get odds for a specific event
   * Cost: [markets] × [regions] credits
   */
  async getEventOdds(sportKey: string, eventId: string, params: {
    regions: string;
    markets: string;
    bookmakers?: string;
    oddsFormat?: 'decimal' | 'american';
    dateFormat?: 'iso' | 'unix';
  }): Promise<ApiResponse<Event>> {
    return this.request<Event>(`/sports/${sportKey}/events/${eventId}/odds`, params as Record<string, string>);
  }

  /**
   * Get scores for a specific sport
   * Cost: 1 credit (2 credits with daysFrom parameter)
   */
  async getScores(sportKey: string, params?: {
    daysFrom?: string;
    dateFormat?: 'iso' | 'unix';
  }): Promise<ApiResponse<Score[]>> {
    return this.request<Score[]>(`/sports/${sportKey}/scores`, params as Record<string, string>);
  }

  /**
   * Get available markets for a specific event
   * Cost: 1 credit
   */
  async getEventMarkets(sportKey: string, eventId: string): Promise<ApiResponse<{ markets: string[] }>> {
    return this.request<{ markets: string[] }>(`/sports/${sportKey}/events/${eventId}/markets`);
  }

  /**
   * Get historical odds for a completed event
   * Cost: Varies (typically 1-3 credits depending on markets)
   * Note: Requires historical API access
   */
  async getHistoricalOdds(sportKey: string, eventId: string, params: {
    date: string; // ISO 8601 timestamp (e.g., "2024-01-20T18:00:00Z")
    regions: string;
    markets: string;
    bookmakers?: string;
    oddsFormat?: 'decimal' | 'american';
    dateFormat?: 'iso' | 'unix';
  }): Promise<ApiResponse<Event>> {
    return this.request<Event>(`/historical/sports/${sportKey}/events/${eventId}/odds`, params as Record<string, string>);
  }

  /**
   * Get total request count for this session
   */
  getRequestCount(): number {
    return this.requestCount;
  }
}

/**
 * Create a singleton instance
 */
let client: TheOddsApiClient | null = null;

export function getTheOddsApiClient(): TheOddsApiClient {
  if (!client) {
    const apiKey = process.env.ODDS_API_KEY;
    if (!apiKey) {
      throw new Error('ODDS_API_KEY environment variable is required');
    }
    client = new TheOddsApiClient({ apiKey });
  }
  return client;
}

/**
 * Helper to create a test client (for development)
 */
export function createTestClient(apiKey: string): TheOddsApiClient {
  return new TheOddsApiClient({ apiKey });
}
