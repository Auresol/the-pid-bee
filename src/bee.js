import { 
  Vector3, 
  MathUtils, 
  Matrix4,
  Quaternion
} from 'three'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { TextureLoader } from 'three';

const gltfLoader = new GLTFLoader();

import { controller } from './controller'
import { config } from './config'

export default class Bee {
  
  constructor(scene) {

    this.scene = scene

    this.gatheringClock = 0;
  
    /* location of bee
     * 0: at hive
     * 1: gathering
     */
    this.location_state = null;

    this.x = MathUtils.randFloat(-10, 10)
    this.z = MathUtils.randFloat(-10, 10)

    this.pos = new Vector3(this.x, 3, this.z)
    this.break_dis = 2;
    this.stop_dis = 0.05;

    this.up_vector = new Vector3(0, 1, 0).normalize();

    this.acc = new Vector3();
    this.vel = new Vector3();

    this.wind_clock = 0

    this.target_pos = new Vector3();
    this.target_origin = new Vector3();
    this.assign_target(config.hivePos)
  }

  update_period() {
    this.ls_period = this.ls_offset + config.stateChange;
  }

  update_config_value() {
    this.max_propel_acc = config.maxPropellerForce/config.mass
    if(this.location_state == 0) {
      this.hovering_cpid_val3();
    } else {
      this.foraging_cpid_val3();
    }
  }

  async init() {
    await this.loadModel();
    this.cpid3_init();
    this.update_config_value();
    this.hovering_cpid_val3()
    this.opid_init();
    this.random_noise_init();
    this.location_state_init();
    this.change_location_state(0);
  }

  update(dt) {
    
    this.location_state_update(dt);
    //this.around_target(dt);

    this.force = new Vector3()
    this.cpid3(dt)
    if(this.force.length() > this.max_propel_acc) {
      this.force.normalize().multiplyScalar(this.max_propel_acc)
    }
    this.random_noise(dt)
    this.wind(dt)
    this.drag(dt)

    this.acc = this.force.clone().multiplyScalar(1/config.mass)
    this.vel.add(this.acc.clone().multiplyScalar(dt))
    this.pos.add(this.vel.clone().multiplyScalar(dt))

    this.opid(dt);
    
    this.body.position.copy(this.pos)
  }
  
  location_state_init() {
    this.ls_offset = MathUtils.randFloat(1, 10) 
    this.ls_period = this.ls_offset + config.stateChange;
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
      this.around_hive_init();
      this.hovering_cpid_val3();
      //const hive = controller.getHive()
      
      this.assign_target(config.hivePos)
    } else if(state == 1) {
      this.around_flower_init();
      this.foraging_cpid_val3();
      let flower_index = MathUtils.randInt(0, config.numberOfFlowers - 1)
      
      let flowers = controller.getFlowers()
      this.assign_target(flowers[flower_index].pos)

    }

    this.location_state = state;

  }

  wind_init() {
    this.wind_mag = config.windStrength;
    this.wind_period = config.windEventDuration;
    this.wind_clock = config.windEventDuration;
  }

  wind(dt) {
    if(this.wind_clock <= 0) return
    this.force.add(new Vector3(0, 0, -this.wind_mag));
    this.wind_clock -= dt;
  }



  random_noise_init() {
    this.rn_period = 0.2;
    this.rn_clock = 0;
    this.rn_force = new Vector3();
  }

  random_noise(dt) {
    let mag = 30 * config.randomMovementMagScale
    if(this.location_state == 1) {
      mag = 5 * config.randomMovementMagScale;
    }
    if(this.rn_clock < 0) {
      this.rn_clock = this.rn_period;
      this.rn_force = new Vector3().randomDirection().multiplyScalar(mag);
    }
    this.rn_clock -= dt;
    this.force.add(this.rn_force)
  }
  

  around_hive_init() {
    this.at_high_radius = 10;
    this.at_low_radius = 6;
    this.at_period = MathUtils.randFloat(1, 2);
    this.at_clock = 1;
  }

  around_flower_init() {
    this.at_high_radius = 1.3;
    this.at_low_radius = 0.3;
    this.at_period = 3;
    this.at_clock = 1;
  }

  around_target(dt) {
    if(this.at_clock < 0) {
      this.target_pos = this.target_origin.clone()
        .add(new Vector3().randomDirection().multiplyScalar(MathUtils.randFloat(this.at_high_radius , this.at_low_radius )))

      this.at_clock = this.at_period
      //console.log("change")
    } else {
      this.at_clock -= dt
    }
  }

  // :'<,'>s/\(^[ a-z._=]*\)\([0-9][0-9]*\)/\1new Vector3(\2 \2 \2)
 
  
  foraging_cpid_val3() {
    this.pos_kp = new Vector3(0.7, 0.7, 0.7).multiplyScalar(config.pidValueScale);
    this.pos_kd = new Vector3(0.3, 0.3, 0.3).multiplyScalar(config.pidValueScale);
    this.pos_old_kd = new Vector3(0, 0, 0)

    this.vel_kp = new Vector3(4, 4, 4).multiplyScalar(config.pidValueScale);
    this.vel_kd = new Vector3(0.4, 0.4, 0.4).multiplyScalar(config.pidValueScale);
    this.vel_old_kd = new Vector3(0, 0, 0)
  }

  hovering_cpid_val3() {
    this.pos_kp = new Vector3(0.9, 0.9, 0.9).multiplyScalar(config.pidValueScale);
    this.pos_kd = new Vector3(0.3, 0.45, 0.3).multiplyScalar(config.pidValueScale);
    this.pos_old_kd = new Vector3(0, 0, 0)

    this.vel_kp = new Vector3(4, 3, 4).multiplyScalar(config.pidValueScale);
    this.vel_kd = new Vector3(0.9, 0.4, 0.9).multiplyScalar(config.pidValueScale);
    this.vel_old_kd = new Vector3(0, 0, 0);
  }

  cpid3(dt) {
    if (dt <= 0 || isNaN(dt)) return;

    let pos_dis = this.target_pos.clone().sub(this.pos)
    //let pos_dir = new Vector3().subVectors(this.target_pos, this.pos).normalize();
    let pos_p_kd = new Vector3();
    if(dt != 0) {
      pos_p_kd = this.pos_kd.clone().multiply(this.pos_old_kd.sub(pos_dis).multiplyScalar(1/dt))
    }
    this.pos_old_kd = pos_dis;

    let desire_vel = this.pos_kp.clone().multiply(pos_dis).add(pos_p_kd)

    let vel_dis = desire_vel.clone().sub(this.vel)
    //let vel_dir = new Vector3().subVectors(this.target_pos, this.vel).normalize();

    let vel_p_kd = new Vector3();
    if(dt != 0) {
      vel_p_kd = this.vel_kd.clone().multiply(this.vel_old_kd.sub(vel_dis).multiplyScalar(1/dt))
    }
    this.vel_old_kd = vel_dis;
    let desire_force = this.vel_kp.clone().multiply(vel_dis).add(vel_p_kd)

    this.force.add(desire_force)
  }
  cpid3_init() {
    this.pos_error_prev = new Vector3();
    this.pos_error_prev_prev = new Vector3();
    this.vel_error_prev = new Vector3();
    this.vel_error_prev_prev = new Vector3();

    this.pos_pid_prev = new Vector3();
    this.vel_pid_prev = new Vector3();

    this.desired_vel = new Vector3(); // Accumulated desired velocity
    this.desired_force = new Vector3(); // Accumulated desired force
  }
  // foraging_cpid_val3() {
  //   this.pos_kp = new Vector3(0.7, 1.2, 0.7).multiplyScalar(config.pidValueScale);
  //   //this.pos_ki = new Vector3(0.01, 0.02, 0.01).multiplyScalar(config.pidValueScale); // Example Ki
  //   this.pos_ki = new Vector3()
  //   this.pos_kd = new Vector3(0.1, 0.6, 0.1).multiplyScalar(config.pidValueScale);

  //   this.vel_kp = new Vector3(2, 2, 2).multiplyScalar(config.pidValueScale);
  //   this.vel_ki = new Vector3(0.05, 0.1, 0.05).multiplyScalar(config.pidValueScale); // Example Ki
  //   //this.pos_ki = new Vector3()
  //   //this.vel_kd = new Vector3(0.8, 0.9, 0.8).multiplyScalar(config.pidValueScale);
  // }

  // hovering_cpid_val3() {
  //   this.pos_kp = new Vector3(1.1, 1.1, 1.1).multiplyScalar(config.pidValueScale);
  //   this.pos_ki = new Vector3(0.01, 0.01, 0.01).multiplyScalar(config.pidValueScale); // Example Ki
  //   this.pos_kd = new Vector3(0.3, 0.4, 0.3).multiplyScalar(config.pidValueScale);

  //   this.vel_kp = new Vector3(4, 4, 4).multiplyScalar(config.pidValueScale);
  //   this.vel_ki = new Vector3(0.05, 0.03, 0.05).multiplyScalar(config.pidValueScale); // Example Ki
  //   //this.vel_kd = new Vector3(0.9, 0.5, 0.9).multiplyScalar(config.pidValueScale);
  //   this.vel_kd = new Vector3()
  // }

  // cpid3(dt) {
  //   if (dt <= 0 || isNaN(dt)) return;

  //   // --- Position Control (Velocity Form) ---
  //   const pos_error = this.target_pos.clone().sub(this.pos);
  //   const desire_vel = new Vector3();

  //   // Proportional term (change in error)
  //   const delta_pos_p = pos_error.clone().sub(this.pos_error_prev).multiply(this.pos_kp);
  //   desire_vel.add(delta_pos_p);

  //   // Integral term (based on current error)
  //   const delta_pos_i = pos_error.clone().multiply(this.pos_ki).multiplyScalar(1/dt)
  //   desire_vel.add(delta_pos_i);

  //   // Derivative term (change in rate of error)
  //   const delta_pos_d = pos_error.clone().sub(this.pos_error_prev).sub(this.pos_error_prev.clone().sub(this.pos_error_prev_prev)).multiplyScalar(1 / dt).multiply(this.pos_kd);
  //   desire_vel.add(delta_pos_d);

  //   const vel_tmp = desire_vel.clone()

  //   // Add previous PID
  //   // desire_vel.add(this.pos_pid_prev)

  //   // Update previous errors
  //   this.pos_error_prev_prev.copy(this.pos_error_prev);
  //   this.pos_error_prev.copy(pos_error);
  //   this.pos_pid_prev = vel_tmp


  //   // --- Velocity Control (Velocity Form) ---
  //   const vel_error = desire_vel.clone().sub(this.vel);
  //   const desire_force = new Vector3();

  //   // Proportional term (change in error)
  //   const delta_vel_p = vel_error.clone().sub(this.vel_error_prev).multiply(this.vel_kp);
  //   desire_force.add(delta_vel_p);

  //   // Integral term (based on current error)
  //   const delta_vel_i = vel_error.clone().multiply(this.vel_ki).multiplyScalar(1/dt)
  //   desire_force.add(delta_vel_i);

  //   // Derivative term (change in rate of error)
  //   const delta_vel_d = vel_error.clone().sub(this.vel_error_prev).sub(this.vel_error_prev.clone().sub(this.vel_error_prev_prev)).multiplyScalar(1 / dt).multiply(this.vel_kd);
  //   desire_force.add(delta_vel_d);

  //   const force_tmp = desire_force.clone()

  //   // Add previous PID
  //   //desire_force.add(this.vel_pid_prev)

  //   // Update previous errors
  //   this.vel_error_prev_prev.copy(this.vel_error_prev);
  //   this.vel_error_prev.copy(vel_error);
  //   this.vel_pid_prev = force_tmp

  //   // Accumulate the desired force
  //   this.force.add(desire_force);
  // }

  drag(dt) {
    this.force.add(this.force.clone()
      .normalize().multiplyScalar(this.vel.length() * -config.dragCof * dt))
  }
  

//  cpid(dt) {
//    if (dt <= 0 || isNaN(dt)) return;
//
//    let pos_dis = this.pos.distanceTo(this.target_pos)
//    if(pos_dis < this.break_dis) {
//      this.state = 2;
//    } else {
//      this.state = 1;
//    }
//    let pos_dir = new Vector3().subVectors(this.target_pos, this.pos).normalize();
//    
//    let pos_p_kd = 0;
//    if(dt != 0 && this.abs(this.pos_old_kd - pos_dis) > 0.001) {
//      pos_p_kd = this.pos_kd * (this.pos_old_kd - pos_dis)/dt
//    }
//    this.pos_old_kd = pos_dis;
//    this.pos_accu_ki += this.pos_ki * dt * pos_dis
//    let desire_vel = this.pos_kp * pos_dis + pos_p_kd + this.pos_accu_ki
//    let target_pos_vel = pos_dir.clone().multiplyScalar(desire_vel)
//
//    let vel_dis = this.vel.distanceTo(target_pos_vel) 
//    let vel_dir = new Vector3().subVectors(target_pos_vel, this.vel).normalize();
//
//    let vel_p_kd = 0;
//    if(dt != 0 && this.abs(this.vel_old_kd - vel_dis) > 0.001) {
//      vel_p_kd = this.vel_kd * (this.vel_old_kd - vel_dis)/dt
//    }
//    this.vel_old_kd = vel_dis;
//    this.vel_accu_ki += this.vel_ki * dt * vel_dis
//    let desire_force = this.vel_kp * vel_dis + vel_p_kd + this.vel_accu_ki
//
//    this.acc.add(vel_dir.multiplyScalar(desire_force))
//  }

 opid_init() {
   this.look_target = new Quaternion()
   this.rot = new Quaternion()
   this.rot_old_kd = 0
   this.rot_kp = 1.2;
   this.rot_kd = 0.5;
   this.rot_ki = 0;
   this.rot_accu_ki = 0;
 }

 opid(dt) {
   if (dt <= 0 || isNaN(dt)) return;

   let look = new Matrix4().lookAt(this.target_pos, this.pos, this.up_vector);
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

   if (!isNaN(rot_set.x) && !isNaN(rot_set.y) && !isNaN(rot_set.z) && !isNaN(rot_set.w)) {
    this.rot.copy(rot_set);
    this.rot.normalize(); 
  } else {
      console.error("NaN detected in rotation quaternion! Resetting.", rot_set);
      this.rot.identity();
      this.rot_old_kd = 0;
      this.rot_accu_ki = 0;
  }

   this.body.setRotationFromQuaternion(this.rot);
   //this.body.setRotationFromQuaternion(new Quaternion(0, 0, 1, 1).normalize());
   //this.body.setRotationFromMatrix(look)
 }
  
  // opid_init() {
  //   this.look_target = new Quaternion();
  //   this.rot = new Quaternion();

  //   // Velocity form holders
  //   this.rot_error_prev = 0;
  //   this.rot_error_prev_prev = 0;
  //   this.integrated_rot_error = 0;

  //   // Gains
  //   this.rot_kp = 0.6;
  //   this.rot_kd = 0.3;
  //   this.rot_ki = 0; // You can set an initial Ki value here
  // }

  // opid(dt) {
  //   if (dt <= 0 || isNaN(dt)) return;

  //   let look = new Matrix4().lookAt(this.pos, this.target_pos, this.up_vector);
  //   this.look_target.setFromRotationMatrix(look);

  //   const rot_error = this.quaternion_dis(this.look_target, this.rot);
  //   let delta_desired_omega = 0;

  //   // Proportional term (change in error)
  //   const delta_rot_p = (rot_error - this.rot_error_prev) * this.rot_kp;
  //   delta_desired_omega += delta_rot_p;

  //   // Integral term (based on current error)
  //   this.integrated_rot_error += rot_error * dt * this.rot_ki;
  //   delta_desired_omega += this.integrated_rot_error;

  //   // Derivative term (change in rate of error)
  //   const delta_rot_d = (rot_error - this.rot_error_prev) - (this.rot_error_prev - this.rot_error_prev_prev);
  //   if (dt !== 0) {
  //     delta_desired_omega += (delta_rot_d / dt) * this.rot_kd;
  //   }

  //   // Update previous errors
  //   this.rot_error_prev_prev = this.rot_error_prev;
  //   this.rot_error_prev = rot_error;

  //   // Accumulate the desired angular velocity (omega)
  //   const desired_omega = delta_desired_omega; // In velocity form, this is the change

  //   const dir = this.quaternion_dir(this.look_target, this.rot);
  //   const delta_rotation = new Quaternion().setFromAxisAngle(dir, desired_omega * dt);

  //   let rot_set = this.rot.clone().multiply(delta_rotation);
  //   if (!isNaN(rot_set.x) && !isNaN(rot_set.y) && !isNaN(rot_set.z)) {
  //     this.rot = rot_set;
  //   }
  //   this.body.setRotationFromQuaternion(this.rot);
  // }

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

  assign_target(target_pos) {
    this.target_origin = target_pos;
    this.target_pos = target_pos;
  }


  async loadModel() {
      try {
          const gltf = await gltfLoader.loadAsync('/models/smol_bee_3.glb');
          this.body = gltf.scene;
          this.body.name = 'bee';
          this.body.position.copy(this.pos);
          this.body.scale.multiplyScalar(0.01)
          this.scene.add(this.body)
          return this.body; // Resolve the promise with the loaded body
      } catch (error) {
          console.error('An error happened while loading the GLTF model', error);
          throw error; // Re-throw the error to be caught elsewhere
      }
  }

  dispose() {
    if (this.bodyGeometry) {
        this.bodyGeometry.dispose();
        this.bodyGeometry = null;
    }
    if (this.bodyMaterial) {
        this.bodyMaterial.dispose();
        this.bodyMaterial = null;
    }
    // You might want to remove the mesh from the scene here if it's still added
    // For example, if you have a 'scene' property in your Hive class or elsewhere:
    if (this.body && this.body.parent) {
         this.body.parent.remove(this.body);
    }
    this.body = null;
  }
}

