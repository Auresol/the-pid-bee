import {
    Vector3,
    MathUtils,
    BoxGeometry,
    MeshBasicMaterial,
    Mesh,
    Group
} from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const gltfLoader = new GLTFLoader();

export default class Hive {

    constructor(scene) {
        this.body = null;
        this.pos = new Vector3(0, 2, 0);
        this.scene = scene;
        this.loadModel(); // Store the loading Promise
    }

    async loadModel() {
      try {
          const gltf = await gltfLoader.loadAsync('/models/hivebox.glb');
          this.body = gltf.scene;
          this.body.name = 'bee';
          this.body.position.copy(this.pos);
          this.body.scale.multiplyScalar(2)
          this.scene.add(this.body)
          return this.body; // Resolve the promise with the loaded body
      } catch (error) {
          console.error('An error happened while loading the GLTF model', error);
          throw error; // Re-throw the error to be caught elsewhere
      }
    }

    async init() {
      await this.loadModel();
      this.target = new Vector3();
      this.acc = new Vector3();
      this.vel = new Vector3();
    }

    dispose() {
        if (this.body) {
            if (this.body.parent) {
                this.body.parent.remove(this.body);
            }
            this.body = null;
        }
    }

}
