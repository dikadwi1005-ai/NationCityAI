export const RESIDENTIAL_ARCHETYPES=['tropical-veranda','modern-courtyard','modern-duplex','townhouse','carport-house','balcony-house','garden-bungalow','split-roof-house'] as const;
export type RoadConnections={n:boolean;e:boolean;s:boolean;w:boolean};
export function visualVariant(id:string){return parseInt(id.slice(-8),16)%RESIDENTIAL_ARCHETYPES.length}
export const FIXTURE_ASSETS=['shop','shophouse','cafe','service','recreation','parking'] as const;
export type FixtureAsset=typeof FIXTURE_ASSETS[number];
