// EllipsoidalOccluder still exists at runtime but was removed from public Cesium types.
export type EllipsoidalOccluder = {
  isPointVisible: (position: import('cesium').Cartesian3) => boolean;
};

export type CesiumWithOccluder = typeof import('cesium') & {
  EllipsoidalOccluder: new (
    ellipsoid: import('cesium').Ellipsoid,
    cameraPosition: import('cesium').Cartesian3,
  ) => EllipsoidalOccluder;
};

export type CesiumModule = typeof import('cesium');
export type CesiumEntity = import('cesium').Entity;

export const removeEntitiesWithPrefix = (
  viewer: import('cesium').Viewer,
  prefix: string,
) => {
  const toRemove = viewer.entities.values.filter(
    (entity) => typeof entity.id === 'string' && entity.id.startsWith(prefix),
  );
  toRemove.forEach((entity) => viewer.entities.remove(entity));
};

export const trackAppearance = (
  id: string,
  stormYear: number,
  selectedStormId: string,
  selectedYear: number,
) => {
  const isSelected = id === selectedStormId;
  const isSelectedYear = stormYear === selectedYear;
  return {
    width: isSelected ? 4 : isSelectedYear ? 2 : 1,
    alpha: isSelected ? 1 : isSelectedYear ? 0.5 : 0.15,
    color: isSelected ? 'white' : 'gray',
  };
};

export const longestVisibleSegment = (
  positions: import('cesium').Cartesian3[],
  occluder: EllipsoidalOccluder,
) => {
  let longest: import('cesium').Cartesian3[] = [];
  let current: import('cesium').Cartesian3[] = [];

  for (const position of positions) {
    if (occluder.isPointVisible(position)) {
      current.push(position);
      continue;
    }
    if (current.length > longest.length) longest = current;
    current = [];
  }

  if (current.length > longest.length) longest = current;
  return longest.length >= 2 ? longest : [];
};
