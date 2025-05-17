import { 
  Vector3, 
  MathUtils, 
  SphereGeometry, 
  MeshBasicMaterial, 
  Mesh,
  CylinderGeometry,
  Matrix4,
  Euler,
  Quaternion,
  Scene
} from 'three'

export default class Bee {
  
  constructor(scene) {

    this.scene = scene
    this.color = 0xff66ff
    
    /* state define the bee's current state, which is
     * 0: do nothing
     * 1: foraging
     * 2: gathering 
     * 3: return
     */
    this.state = 1;
    this.gatheringClock = 0;
  
    /* location of bee
     * 0: at hive
     * 1: gathering
     */
    this.location_state = 1;

    this.x = MathUtils.randFloat(-10, 10)
    this.z = MathUtils.randFloat(-10, 10)

    this.bodyGeometry = new CylinderGeometry(0.1, 0.1, 0.3, 10); // radiusTop, radiusBottom, height, radialSegments
    this.bodyMaterial = new MeshBasicMaterial({ color: 0xffff00 });
    this.body = new Mesh(this.bodyGeometry, this.bodyMaterial);
    this.body.name = 'bee'

    this.pos = new Vector3(this.x, 3, this.z)
    this.break_dis = 2;
    this.stop_dis = 0.05;

    this.up_vector = new Vector3(-1, 0, 0);

    this.acc = new Vector3();
    this.vel = new Vector3();

    this.from_target = new Vector3();
    this.to_target = new Vector3();
  }

  init() {
    this.old_dis;
    this.u_clock = 10;
    this.cpid_init();
    this.opid_init();
    this.wind_init();
    this.around_hive_init();
    this.random_noise_init();
    this.change_location_state(0) ;
    this.location_state_init();
  }

  update(dt) {
    
    this.location_state_update(dt);
    if(this.location_state == 1) {
      if(this.u_clock < 0){ 
        this.u_clock = 10;
        this.pos_accu_ki = 0;
        this.vel_accu_ki = 0;
        let temp = new Vector3().copy(this.to_target);
        this.to_target.copy(this.from_target);
        this.from_target.copy(temp)
      }
      this.u_clock -= dt;
    } else {
      this.around_hive(dt);
    }

    this.acc = new Vector3()
    this.cpid(dt)
    if(this.acc.length() > this.lim_acc) {
      this.acc.normalize().multiplyScalar(this.lim_acc)
    }
    this.random_noise(dt)
    this.wind(dt)

    this.vel.add(this.acc.clone().multiplyScalar(dt))
    this.pos.add(this.vel.clone().multiplyScalar(dt))

    this.opid(dt);
    
    this.body.position.copy(this.pos)
  }
  
  location_state_init() {
    this.ls_period = MathUtils.randInt(3,10);
    this.ls_clock = this.ls_period;
  }

  location_state_update(dt) {
    if(this.ls_clock <= 0) {
      if(this.location_state == 0) this.change_location_state(1)
      else this.change_location_state(0)
      this.ls_clock = this.ls_period
    }

    this.ls_clock -= dt;

  }

  change_location_state(state) {
    if(this.location_state == state) return;

    if(state == 0) {
      this.hovering_cpid_val();
    } else if(state == 1) {
      this.foraging_cpid_val();
      let flowers = [];
      this.scene.traverse(function (object) {
        if (object.name === 'flower') {
            flowers.push(object);
        }
      });

      this.to_target = flowers[MathUtils.randInt(0, flowers.length - 1)].position

    }

    this.location_state = state;

  }

  wind_init() {
    this.wind_period = 5;
    this.wind_mag = 0;
    this.wind_clock = 0;
  }

  wind(dt) {
    if(this.wind_clock < 1) {
      this.acc.add(new Vector3(0, 0, -this.wind_mag));
    }
    if(this.wind_clock <= 0) {
      this.wind_clock = this.wind_period
    }

    this.wind_clock -= dt;
  }



  random_noise_init() {
    this.rn_period = 0.2;
    this.rn_clock = 0;
    this.rn_acc = new Vector3();
  }

  random_noise(dt) {
    let mag = 1;
    if(this.state == 2) {
      mag = 10;
    }
    this.around_hive();
    if(this.rn_clock < 0) {
      this.rn_clock = this.rn_period;
      this.rn_acc = new Vector3().random().addScalar(-0.5).multiplyScalar(mag);
    }
    this.rn_clock -= dt;
    this.acc.add(this.rn_acc)
  }
  

  around_hive_init() {
    this.ah_high_radius = 6;
    this.ah_low_radius = 3;
    this.ah_period = MathUtils.randFloat(1, 2);
    this.ah_clock = 1;
  }

  around_hive(dt) {
    if(this.ah_clock < 0) {
      this.to_target = new Vector3().randomDirection().multiplyScalar(MathUtils.randFloat(this.ah_high_radius, this.ah_low_radius)).add(new Vector3(0, 4, 0))
      this.ah_clock = this.ah_period
      //console.log("change")
    }

    if(dt > 0) {
      this.ah_clock -= dt;
    }
  }

  foraging_cpid_val() {
    this.pos_kp = 0.7;
    this.pos_ki = 0;
    this.pos_accu_ki = 0;
    this.pos_kd = 0.1;
    this.pos_old_kd = 0;

    this.vel_kp = 2;
    this.vel_ki = 0;
    this.vel_accu_ki = 0;
    this.vel_kd = 0.8;
    this.vel_old_kd = 0;

    this.lim_acc = 50;
  }

  hovering_cpid_val() {
    this.pos_kp = 1;
    this.pos_ki = 0;
    this.pos_accu_ki = 0;
    this.pos_kd = 0.3;
    this.pos_old_kd = 0;

    this.vel_kp = 5;
    this.vel_ki = 0;
    this.vel_accu_ki = 0;
    this.vel_kd = 1.5;
    this.vel_old_kd = 0;

    this.lim_acc = 50;
  }

  cpid_init() {
    this.pos_kp = 0.5;
    this.pos_ki = 0;
    this.pos_accu_ki = 0;
    this.pos_kd = 0.4;
    this.pos_old_kd = 0;

    this.vel_kp = 4;
    this.vel_ki = 0;
    this.vel_accu_ki = 0;
    this.vel_kd = 1;
    this.vel_old_kd = 0;

    this.lim_acc = 50;
  }

  cpid(dt) {
    if (dt <= 0 || isNaN(dt)) return;

    let pos_dis = this.pos.distanceTo(this.to_target)
    if(pos_dis < this.break_dis) {
      this.state = 2;
    } else {
      this.state = 1;
    }
    let pos_dir = new Vector3().subVectors(this.to_target, this.pos).normalize();
    
    let pos_p_kd = 0;
    if(dt != 0 && this.abs(this.pos_old_kd - pos_dis) > 0.001) {
      pos_p_kd = this.pos_kd * (this.pos_old_kd - pos_dis)/dt
    }
    this.pos_old_kd = pos_dis;
    this.pos_accu_ki += this.pos_ki * dt * pos_dis
    let desire_vel = this.pos_kp * pos_dis + pos_p_kd + this.pos_accu_ki
    let to_target_vel = pos_dir.clone().multiplyScalar(desire_vel)

    let vel_dis = this.vel.distanceTo(to_target_vel) 
    let vel_dir = new Vector3().subVectors(to_target_vel, this.vel).normalize();

    let vel_p_kd = 0;
    if(dt != 0 && this.abs(this.vel_old_kd - vel_dis) > 0.001) {
      vel_p_kd = this.vel_kd * (this.vel_old_kd - vel_dis)/dt
    }
    this.vel_old_kd = vel_dis;
    this.vel_accu_ki += this.vel_ki * dt * vel_dis
    let desire_acc = this.vel_kp * vel_dis + vel_p_kd + this.vel_accu_ki

    this.acc.add(vel_dir.multiplyScalar(desire_acc))
  }

  opid_init() {
    this.look_target = new Quaternion()
    this.rot = new Quaternion()
    this.rot_old_kd = 0
    this.rot_kp = 0.6;
    this.rot_kd = 0.1;
    this.rot_ki = 0;
    this.rot_accu_ki = 0;
  }

  opid(dt) {
    if (dt <= 0 || isNaN(dt)) return;

    let look = new Matrix4().lookAt(this.pos, this.to_target, this.up_vector);
    this.look_target.setFromRotationMatrix(look);

    let dis = this.quaternion_dis(this.look_target, this.rot);
    let dir = this.quaternion_dir(this.look_target, this.rot);

    let rot_o_kd = 0;
    if (dt != 0 && Math.abs(this.rot_old_kd - dis) > 0.001) {
      rot_o_kd = this.rot_kd * (this.rot_old_kd - dis) / dt;
    }
    this.rot_old_kd = dis;
    this.rot_accu_ki += this.rot_ki * dt * dis;

    let desire_omega = this.rot_kp * dis + rot_o_kd + this.rot_accu_ki; 
    let delta_rotation = new Quaternion().setFromAxisAngle(dir, desire_omega * dt);
    
    let rot_set = this.rot.clone().multiply(delta_rotation)
    if(!isNaN(rot_set.x) && !isNaN(rot_set.y) && !isNaN(rot_set.z)){
      this.rot = rot_set
    }
    this.body.setRotationFromQuaternion(this.rot);
  }

  abs(x) {
    if( x < 0 ) return -x;
    return x;
  }

  min(x, y){
    if(x > y) return y
    return x
  }

  max(x, y) {
    if(x > y) return x
    return y
  }

  quaternion_dis(q1, q2) {
      const dotProduct = q1.dot(q2);
      const clampedDotProduct = Math.max(-1, Math.min(1, dotProduct));
      const angle = Math.acos(clampedDotProduct) * 2;
      return angle;
  }

  quaternion_dir(q1, q2) {
    const q1Inverse = new Quaternion();
    q1Inverse.copy(q1).invert();
    const direction = new Quaternion();
    direction.multiplyQuaternions(q2, q1Inverse);
    return direction;
  }
}

