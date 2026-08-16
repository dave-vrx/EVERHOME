export type NpcProfile={id:string;name:string;face:string;world:string;line?:string;enabled:boolean};
// Intentionally empty for launch. Future NPCs can be registered here without restoring fake player accounts.
export const npcRoster:ReadonlyArray<NpcProfile>=[];
export const activeNpcsForWorld=(world:string)=>npcRoster.filter(n=>n.enabled&&n.world===world);
