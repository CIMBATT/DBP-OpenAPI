export type MaintenanceEvent = {
  eventDate: string;
  activityType: {
    code: string;
    definition: string;
  };
  modifications: Record<string, unknown>;
};

export type Performance = Record<string, unknown>;

export type DigitalBatteryPassport = {
  materialComposition: Record<string, unknown>;
  circularity: Record<string, unknown>;
  supplyChainDueDiligence: Record<string, unknown>;
  maintenanceInformation: MaintenanceEvent[];
  performance: Performance;
  dynamicUpdates?: Array<Record<string, unknown>>;
  carbonFootprint: Record<string, unknown>;
  generalProductInformation: Record<string, unknown>;
  labeling: Record<string, unknown>;
};

export type BORegistration = {
  boURL: string;
  username?: string;
  password?: string;
  apiKey?: string;
};
