import { 
  Vector3, 
  MathUtils, 
  CylinderGeometry, 
  MeshBasicMaterial, 
  Mesh 
} from 'three'

import { config } from './config'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { TextureLoader } from 'three';

const gltfLoader = new GLTFLoader();
const textureLoader = new TextureLoader();
export default class Flower {
  
  constructor(scene) {
    this.scene = scene
    const lim = config.groundSize/2;

    this.x = MathUtils.randFloat(-lim, lim)
    this.z = MathUtils.randFloat(-lim, lim)

    this.pos = new Vector3(this.x, 2, this.z)
  }

  async init() {
    await this.loadModel()
  }

  async loadModel() {
    try {
        const gltf = await gltfLoader.loadAsync('/models/low_poly_flower.glb');
        this.body = gltf.scene;
        this.body.name = 'flower';
        this.body.position.copy(this.pos);
        this.body.scale.multiplyScalar(1)
        this.body.position.set(this.x, 0, this.z)
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
