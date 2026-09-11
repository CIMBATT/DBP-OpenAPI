import type { BORegistration, DigitalBatteryPassport } from './types';

export const API_KEY = process.env.API_KEY ?? 'demo-api-key';

export const passportTemplate: DigitalBatteryPassport = {
  materialComposition: {
    batteryChemistry: { clearName: 'NMC', shortName: 'NMC' },
    hazardousSubstances: [
      {
        hazardousSubstanceIdentifier: 'lead',
        hazardousSubstanceImpact: ['environmental risk', 'restricted disposal'],
        hazardousSubstanceLocation: { componentName: 'battery pack casing' },
      },
    ],
    batteryMaterials: [
      {
        batteryMaterial: 'Nickel',
        batteryMaterialLocation: [{ componentName: 'cathode' }],
        isCriticalRawMaterial: true,
      },
      {
        batteryMaterial: 'Graphite',
        batteryMaterialLocation: [{ componentName: 'anode' }],
        isCriticalRawMaterial: false,
      },
    ],
  },
  circularity: {
    renewableContent: 0.63,
    recycledContent: [
      {
        recycledMaterial: 'nickel',
        postConsumerShare: 0.42,
        preConsumerShare: 0.18,
      },
      {
        recycledMaterial: 'copper',
        postConsumerShare: 0.31,
        preConsumerShare: 0.12,
      },
      {
        recycledMaterial: 'steel',
        postConsumerShare: 0.28,
        preConsumerShare: 0.1,
      },
      {
        recycledMaterial: 'graphite',
        postConsumerShare: 0.24,
        preConsumerShare: 0.09,
      },
    ],
    endOfLifeInformation: {
      wastePrevention: 'Component re-use before recycling',
      separateCollection: 'Mandatory battery collection system',
      informationOnCollection: 'Return to authorized collection centre',
    },
    sparePartSources: [
      {
        nameOfSupplier: 'VoltCore Components',
        components: [{ partName: 'cooling fan' }, { partName: 'battery sensor' }],
      },
    ],
  },
  supplyChainDueDiligence: {
    supplyChainDueDiligenceReport: 'https://example.com/due-diligence/report.pdf',
    supplyChainIndices: 0.92,
    thirdPartyAssurances: 'ISO 14001 and RMI audit',
  },
  maintenanceInformation: [
    {
      eventDate: '2026-01-16T10:00:00.000Z',
      activityType: { code: 'REPAIR', definition: 'Battery pack repair' },
      modifications: {
        maintenanceInformation: 'Replaced cooling fan and battery sensors.',
        generalProductInformation: {
          operatorInformation: { identifier: 'MFG-OP-17' },
          productIdentifier: 'battery-001',
        },
        circularity: {
          replacementComponents: [{ partName: 'cooling fan' }, { partName: 'battery sensor' }],
        },
      },
    },
  ],
  performance: {
    batteryCondition: {
      capacityFade: {
        capacityFadeValue: 0.04,
        lastUpdate: '2026-01-16T10:00:00.000Z',
      },
      internalResistanceIncrease: [
        {
          lastUpdateInternalResistanceIncrease: '2026-01-16T10:00:00.000Z',
          batteryComponent: 'pack',
          internalResistanceIncreaseValue: 0.03,
        },
      ],
    },
    batteryTechnicalProperties: {
      cRate: 1.2,
      cRateLifeCycleTest: 1.15,
      capacityThresholdForExhaustion: 0.7,
      expectedLifetime: 3000,
      expectedNumberOfCycles: 4000,
      initialInternalResistance: [{ batteryComponent: 'cell', ohmicResistance: 0.015 }],
      lifetimeReferenceTest: 'EU battery lifecycle report',
      maximumVoltage: 420,
      minimumVoltage: 250,
      nominalVoltage: 360,
      originalPowerCapability: [{ powerCapabilityAt: 9.5, atSoC: 50 }],
      powerFade: 0.06,
      ratedCapacity: 95,
      ratedMaximumPower: 180,
      roundTripEfficiencyFade: 0.08,
      roundTripEfficiencyat50PerCentCycleLife: 0.91,
      roundtripEfficiency: 0.92,
      temperatureRangeIdleState: { maximum: 45, minimum: -20 },
      ratedEnergy: 34.2,
      powerCapabilityRatio: 1.2,
      initialSelfDischarge: 0.02,
    },
  },
  dynamicUpdates: [
    {
      lastUpdate: '2026-01-16T10:00:00.000Z',
      generalProductInformation: {
        operatorInformation: { identifier: 'OPS-01' },
        batteryStatus: 'In service',
      },
      performance: {
        stateOfCharge: 78,
      },
    },
  ],
  carbonFootprint: {
    absoluteCarbonFootprint: 74.6,
    batteryCarbonFootprint: 74.6,
    carbonFootprintStudy: 'https://example.com/carbon-footprint-study.pdf',
    carbonFootprintPerformanceClass: 'B',
    carbonFootprintPerLifecycleStage: {
      carbonFootprintPerLifecycleStage1: [
        { lifecycleStage: 'manufacture', carbonFootprint: 28.4 },
        { lifecycleStage: 'use', carbonFootprint: 42.6 },
      ],
    },
  },
  generalProductInformation: {
    manufacturerInformation: { identifier: 'ACME-BATTERY-INDUSTRIES' },
    batteryMass: 420.5,
    manufacturingDate: '2025-01-15T00:00:00.000Z',
    manufacturingPlace: { postalCode1: '80333' },
    productIdentifier: 'battery-001',
    warrantyPeriod: '84 months',
    batteryCategory: 'EV',
    batteryPassportIdentifier: 'BP-001',
    puttingIntoService: '2025-02-20T00:00:00.000Z',
    operatorInformation: { identifier: 'ACME-OPS-01' },
  },
  labeling: {
    resultOfTestReport: 'CE-TR-2025-001',
    declarationOfConformity: 'EU Declaration of Conformity 2025',
    labels: [
      { labelingMeaning: 'CE mark', labelingSymbol: 'CE', labelingSubject: 'battery' },
      { labelingMeaning: 'Battery recycling', labelingSymbol: 'recycle', labelingSubject: 'battery' },
      { labelingMeaning: 'Keep dry', labelingSymbol: 'dry', labelingSubject: 'battery' },
      { labelingMeaning: 'Handle with care', labelingSymbol: 'warning', labelingSubject: 'battery' },
    ],
  },
};

export const passports = new Map<string, DigitalBatteryPassport>();
const batteryIds = [
  'battery-001',
  'battery-002',
  'battery-003',
  'battery-004',
  'battery-005',
  'battery-006',
  'battery-007',
  'battery-008',
];

for (const batteryId of batteryIds) {
  const passport = structuredClone(passportTemplate) as DigitalBatteryPassport;
  passport.generalProductInformation = {
    ...passport.generalProductInformation,
    productIdentifier: batteryId,
  };

  passport.maintenanceInformation = passport.maintenanceInformation.map((entry) => {
    const modifications = (entry.modifications ?? {}) as Record<string, unknown>;
    const generalProductInformation = (modifications.generalProductInformation ?? {}) as Record<string, unknown>;

    return {
      ...entry,
      modifications: {
        ...modifications,
        generalProductInformation: {
          ...generalProductInformation,
          productIdentifier: batteryId,
        },
      },
    };
  });

  passports.set(batteryId, passport);
}

export let boRegistration: BORegistration = {
  boURL: 'https://example.com/back-office',
  username: 'dbp-admin',
  password: 'change-me',
  apiKey: 'demo-bo-api-key',
};
