import { 
  Vector3, 
  MathUtils, 
  SphereGeometry, 
  MeshBasicMaterial, 
  Mesh 
} from 'three'

export default class Hive {
  
  constructor(id) {
    this.id = id;
    this.color = 0xff66ff

    const bodyGeometry = new SphereGeometry( 2, 10, 10 ); 
		const bodyMaterial = new MeshBasicMaterial( { color: 0x0000cc } );
	  this.body = new Mesh( bodyGeometry, bodyMaterial );
    this.body.name = 'hive';
    this.pos = new Vector3(0, 2, 0)
    this.body.position.set(this.pos.x, this.pos.y, this.pos.z)
    

    this.init();
  }

  init() {
    this.target = new Vector3();
    this.previousTarget = new Vector3();
    this.acc = new Vector3();
    this.vel = new Vector3();

  }

}

