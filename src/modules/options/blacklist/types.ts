export interface BlacklistSettings {
  patterns: string[];
}

export const DEFAULT_BLACKLIST_SETTINGS: BlacklistSettings = {
  patterns: [],
};
