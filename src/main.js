import {
    Clock,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
    MathUtils,
    WebGLCubeRenderTarget,
    CubeCamera,
    CubeRefractionMapping,
    Vector3,
} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { TextureLoader } from 'three';

const gltfLoader = new GLTFLoader();
const textureLoader = new TextureLoader();

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { addLights } from './light'

import { controller, generateController } from './controller'
import { config } from './config'

import { addBackground } from './utils/addHelper'
import { addGUI } from './gui'

let renderer, camera, scene

init()
animate()

function init() {
    /* Setup canvas, scene, camera */
    const canvas = document.querySelector('#c')
    scene = new Scene()
    camera = new PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        100
    )
    camera.position.set(20, 10, 5)
    camera.lookAt(scene.position)

    /* Setup responsive renderer */
    renderer = new WebGLRenderer({ canvas })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    window.addEventListener('resize', onWindowResize)

    /* Setup OrbitControls which lets the user spin around a point */
    const controls = new OrbitControls(camera, canvas)
    controls.target.set(0, 5, 0)
    controls.update()

    scene.background = addBackground()
    addLights(scene)
    
    generateController(scene, camera);

    addGUI(scene)

}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}

function animate() {
  requestAnimationFrame( animate );
  controller.step()
  renderer.render(scene, camera)
}

