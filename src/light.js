import { AmbientLight } from 'three'

function addLights(scene) {
    const ambientLight = new AmbientLight(0xffffff, 25)

    scene.add(ambientLight)
}

export { addLights }

