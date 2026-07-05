export type EventNavShell = 'launcher' | 'tabbed';

// Pure decision for the hybrid in-event nav (FR-003), mirroring decideBootRoute:
// not enrolled → guided launcher; enrolled → the Gallery/Search/＋/You tab shell.
export function decideEventNav({ enrolled }: { enrolled: boolean }): EventNavShell {
  return enrolled ? 'tabbed' : 'launcher';
}
