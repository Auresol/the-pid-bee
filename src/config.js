import {
    Vector3
} from 'three'

export const config = {
  
  /* stage config */
  groundSize: 100,
  numberOfFlowers: 40,
  numberOfBees: 50,

  /* bee's parameter */
  pidValueScale: 1,
  randomMovementMagScale: 1,
  aroundTargetRadiusScale: 1,
  stateChange: 5,
  maxPropellerForce: 200,
  dragCof: 0,

  /* wind event parameter */
  windEventDuration: 0.5,
  windStrength: 10,

  
  hivePos: new Vector3(0, 4, 0),
  mass: 1,
};
