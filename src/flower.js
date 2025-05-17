import { 
  Vector3, 
  MathUtils, 
  CylinderGeometry, 
  MeshBasicMaterial, 
  Mesh 
} from 'three'

import { config } from './config'

export default class Flower {
  
  constructor(id) {
    this.id = id;
    this.color = 0xff66ff

    const lim = config.groundSize/2;

    this.x = MathUtils.randFloat(-lim/2, lim)
    this.z = MathUtils.randFloat(-lim, lim)

    const bodyGeometry = new CylinderGeometry( 0.3, 0.3, 2, 32 ); // radiusTop, radiusBottom, height, radialSegments
    const bodyMaterial = new MeshBasicMaterial( { color: 0xff69b4 } ); // Pink color
    this.body = new Mesh( bodyGeometry, bodyMaterial );
    this.body.name = 'flower'
    this.body.position.set(this.x, 0, this.z) // Position the body   
    this.position = new Vector3(this.x, 5, this.z)
  }
}
