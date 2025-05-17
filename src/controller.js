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
import { config } from './config'

const clock = new Clock()

export default class Controller {

  constructor(scene) {
    this.scene = scene
    this.bees = [];
    this.flowers = [];
    this.hive;

    this.stets = 1;

    this.init();
  }

  init() {
    this.hive = new Hive()
    this.scene.add(this.hive.body)
    
    for(let i = 0;i < config.flowerNum;i++) {
      let flower = new Flower()
      this.flowers.push(flower)
      this.scene.add(flower.body)
    }

    for(let i = 0;i < 30;i++) {
      let bee = new Bee(this.scene)
      
      bee.init();
      this.bees.push(bee)
      this.scene.add(bee.body)
    }
  }

  step() {
    //if(this.stets <= 0) return;
    const time = clock.getDelta() // seconds
    this.bees.forEach(bee => bee.update(time))
    //console.log(this.bees[0].pos)
    this.stets = this.stets - 1;
  }
}

