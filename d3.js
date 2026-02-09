
const selection = {
  append: (...args) => selection,
  attr: (...args) => selection,
  call: (...args) => selection,
  selectAll: (...args) => selection,
  select: (...args) => selection,
  data: (...args) => selection,
  join: (...args) => selection,
  node: () => ({ getBoundingClientRect: () => ({ width: 800, height: 600 }) }),
  on: (...args) => selection,
  remove: () => {},
  merge: (...args) => selection,
  exit: () => selection,
  enter: () => selection,
  text: (...args) => selection,
  transition: () => selection,
  duration: (...args) => selection,
};

export const select = (...args) => selection;

const zoomBehavior = {
  scaleExtent: (...args) => zoomBehavior,
  on: (...args) => zoomBehavior,
  transform: (...args) => {},
};

export const zoom = () => zoomBehavior;

export const zoomIdentity = {
  translate: (...args) => ({ scale: (...args) => ({}) }),
};

const dragBehavior = {
  on: (...args) => dragBehavior,
};

export const drag = () => dragBehavior;

// Fix: Redefined chain and mockForce properties to accept variadic arguments to satisfy TS calls in Evolution.tsx
const chain = (...args) => mockForce;
const mockForce = {
  id: chain,
  distance: chain,
  strength: chain,
  force: chain,
  // Fix: Modified on, stop, and nodes to accept variadic arguments
  on: (...args) => mockForce,
  stop: (...args) => mockForce,
  nodes: (...args) => mockForce
};

// Fix: Updated exported force functions to accept variadic arguments to prevent "Expected 0 arguments" errors
export const forceSimulation = (...args) => mockForce;
export const forceLink = (...args) => mockForce;
export const forceManyBody = (...args) => mockForce;
export const forceCenter = (...args) => mockForce;
