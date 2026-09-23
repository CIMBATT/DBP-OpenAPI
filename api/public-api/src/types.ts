export type ApiError = {
  error: string;
  message: string;
};

export type CreateDigitalBatteryPassportResponse = {
  DBPId: string;
};

export type BORegisterRequest = {
  boURL: string;
  apiKey: string;
  oemName: string;
};

export type Identifier = {
  identifier: string;
};

export type ActivityType = {
  code: string;
  definition: string;
};

export type ComponentReference = {
  partName: string;
};

export type MaintenanceGeneralProductInformation = {
  operatorInformation: Identifier;
  productIdentifier: string;
};

export type MaintenanceCircularity = {
  components?: ComponentReference[];
  replacementComponents?: ComponentReference[];
};

export type MaintenanceModification = {
  maintenanceInformation: string;
  generalProductInformation: MaintenanceGeneralProductInformation;
  circularity: MaintenanceCircularity;
};

export type MaintenanceInformationItem = {
  eventDate: string;
  activityType: ActivityType;
  modifications: MaintenanceModification;
};

export type CapacityFade = {
  capacityFadeValue: number;
  lastUpdate: string;
};

export type InternalResistanceIncrease = {
  lastUpdateInternalResistanceIncrease: string;
  batteryComponent: string;
  internalResistanceIncreaseValue: number;
};

export type BatteryCondition = {
  capacityFade: CapacityFade;
  internalResistanceIncrease: InternalResistanceIncrease[];
};

export type InitialInternalResistance = {
  batteryComponent: string;
  ohmicResistance: number;
};

export type OriginalPowerCapability = {
  powerCapabilityAt: number;
  atSoC: number;
};

export type TemperatureRangeIdleState = {
  maximum: number;
  minimum: number;
};

export type BatteryTechnicalProperties = {
  roundTripEfficiencyFade: number;
  cRate: number;
  initialInternalResistance: InitialInternalResistance[];
  originalPowerCapability: OriginalPowerCapability[];
  ratedCapacity: number;
  capacityThresholdForExhaustion: number;
  nominalVoltage: number;
  lifetimeReferenceTest: string;
  powerCapabilityRatio: number;
  expectedLifetime: number;
  powerFade: number;
  maximumVoltage: number;
  ratedEnergy: number;
  cRateLifeCycleTest: number;
  roundTripEfficiencyat50PerCentCycleLife: number;
  ratedMaximumPower: number;
  roundtripEfficiency: number;
  temperatureRangeIdleState: TemperatureRangeIdleState;
  minimumVoltage: number;
  initialSelfDischarge: number;
  expectedNumberOfCycles: number;
};

export type Performance = {
  batteryCondition: BatteryCondition;
  batteryTechnicalProperties: BatteryTechnicalProperties;
};

export type HazardousSubstanceLocation = {
  componentName: string;
};

export type HazardousSubstance = {
  hazardousSubstanceIdentifier: string;
  hazardousSubstanceImpact: string[];
  hazardousSubstanceLocation: HazardousSubstanceLocation;
};

export type BatteryChemistry = {
  shortName: string;
  clearName?: string;
};

export type BatteryMaterialLocation = {
  componentName: string;
};

export type BatteryMaterial = {
  batteryMaterial: string;
  batteryMaterialLocation: BatteryMaterialLocation[];
  isCriticalRawMaterial: boolean;
};

export type MaterialComposition = {
  batteryChemistry: BatteryChemistry;
  hazardousSubstances: HazardousSubstance[];
  batteryMaterials: BatteryMaterial[];
};

export type RecycledContent = {
  postConsumerShare: number;
  recycledMaterial: string;
  preConsumerShare: number;
};

export type SparePartSource = {
  nameOfSupplier?: string;
  components?: ComponentReference[];
};

export type EndOfLifeInformation = {
  informationOnCollection: string;
  wastePrevention: string;
  separateCollection: string;
};

export type Circularity = {
  renewableContent: number;
  recycledContent: RecycledContent[];
  sparePartSources: SparePartSource[];
  endOfLifeInformation: EndOfLifeInformation;
};

export type SupplyChainDueDiligence = {
  supplyChainDueDiligenceReport: string;
  supplyChainIndices: number;
  thirdPartyAssurances: string;
};

export type CarbonFootprintLifecycleStage = {
  carbonFootprint: number;
  lifecycleStage: string;
};

export type CarbonFootprintPerLifecycleStage = {
  carbonFootprintPerLifecycleStage1: CarbonFootprintLifecycleStage[];
};

export type CarbonFootprint = {
  absoluteCarbonFootprint?: number;
  carbonFootprintPerformanceClass: string;
  carbonFootprintStudy: string;
  batteryCarbonFootprint: number;
  carbonFootprintPerLifecycleStage: CarbonFootprintPerLifecycleStage;
};

export type ManufacturingPlace = {
  postalCode1: string;
};

export type GeneralProductInformation = {
  manufacturerInformation: Identifier;
  puttingIntoService: string;
  manufacturingDate: string;
  operatorInformation?: Identifier;
  batteryMass: number;
  manufacturingPlace: ManufacturingPlace;
  productIdentifier: string;
  warrantyPeriod: string;
  batteryCategory: string;
  batteryPassportIdentifier?: string;
};

export type Label = {
  labelingMeaning: string;
  labelingSymbol: string;
  labelingSubject: string;
};

export type Labeling = {
  resultOfTestReport: string;
  declarationOfConformity: string;
  labels: Label[];
};

export type DynamicUpdateGeneralProductInformation = {
  batteryStatus: string;
  operatorInformation: Identifier;
};

export type DynamicUpdate = {
  lastUpdate: string;
  generalProductInformation: DynamicUpdateGeneralProductInformation;
  performance: Performance | null;
};

export type DigitalBatteryPassport = {
  materialComposition: MaterialComposition;
  circularity: Circularity;
  supplyChainDueDiligence: SupplyChainDueDiligence;
  maintenanceInformation: MaintenanceInformationItem[];
  performance: Performance;
  dynamicUpdates?: DynamicUpdate[];
  carbonFootprint: CarbonFootprint;
  generalProductInformation: GeneralProductInformation;
  labeling: Labeling;
};
