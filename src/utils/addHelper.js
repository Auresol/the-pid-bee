import { DirectionalLightHelper } from 'three'
import {
    TextureLoader,
    CubeTextureLoader,
    RepeatWrapping,
    NearestFilter,
} from 'three'

function addDirectionalLightHelper(scene, light) {
    const helper = new DirectionalLightHelper(light)
    helper.name = 'lightHelper'
    scene.add(helper)
}

function addBackground() {
    const texture = new CubeTextureLoader().load([
        '/models/background/px.png',
        '/models/background/nx.png',
        '/models/background/py.png',
        '/models/background/ny.png',
        '/models/background/pz.png',
        '/models/background/nz.png',
    ])
    return texture
}

export { addBackground, addDirectionalLightHelper }
