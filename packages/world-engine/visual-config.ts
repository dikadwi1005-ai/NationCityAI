/** Presentation units only. Server coordinates/collision and stored state stay unchanged. */
export const METERS_PER_UNIT=3;
export const CITIZEN_SCALE=.26;
export type Quality='low'|'medium'|'high';
export const QUALITY={
 low:{dpr:1,shadow:0,texture:false,normal:false,detail:0,vegetation:48,terrainStep:1},
 // Native desktop resolution keeps the default GPU budget available for the city.
 medium:{dpr:1,shadow:1536,texture:true,normal:false,detail:1,vegetation:140,terrainStep:.5},
 high:{dpr:1.2,shadow:2048,texture:true,normal:true,detail:2,vegetation:240,terrainStep:.5},
} as const;
