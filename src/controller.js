import {
    Clock,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
    MathUtils,
    Vector3,
} from 'three'

import Flower from './flower'
import Bee from './bee'
import Hive from './hive'
import Ground from './ground'
import { config } from './config'

const clock = new Clock()

export let controller;
export const generateController = (scene) => {
  controller = new Controller(scene)
}

class Controller {

  constructor(scene) {
    this.scene = scene
    this.ground = null;
    this.bees = [];
    this.flowers = [];
    this.hive = null;
    this.hive_pos = new Vector3(0, 1, 0)

    this.stets = 1;

    this.init();
  }

  async init() {
    if(this.ground != null) this.ground.dispose();
    this.bees.forEach(bee => bee.dispose());
    this.flowers.forEach(flower => flower.dispose());
    if(this.hive != null)  this.hive.dispose();

    this.ground = new Ground(this.scene);
    this.hive = new Hive(this.scene)
    await this.hive.init();


    this.bees = [];
    this.flowers = [];
    
    for(let i = 0;i < config.numberOfFlowers;i++) {
      let flower = new Flower(this.scene)
      await flower.init()
      this.flowers.push(flower)
      this.scene.add(flower.body)
    }

    for(let i = 0;i < config.numberOfBees;i++) {
      let bee = new Bee(this.scene)
      
      await bee.init();
      this.bees.push(bee)
      this.scene.add(bee.body)
    }
  }

  step() {
    //if(this.stets <= 0) return;
    const time = Math.min(clock.getDelta(), 0.01) // seconds
    this.bees.forEach(bee => bee.update(time))
    //console.log(this.bees[0].pos)
    this.stets = this.stets - 1;
  }

  update_config_value() {
    this.bees.forEach(bee => bee.update_config_value());
  }

  update_config_period() {
    this.bees.forEach(bee => bee.update_period());
  }

  wind_event_initiate() {
    this.bees.forEach(bee => bee.wind_init());
  }

  getFlowers() {
    return this.flowers
  }

  getHivePos() {
    return new Vector3(0, 1, 0) 
  }
}

