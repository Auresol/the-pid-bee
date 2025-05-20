import { AmbientLight, DirectionalLight, DirectionalLightHelper } from 'three'

function addDirectionalLightHelper(scene, light) {
    const helper = new DirectionalLightHelper(light)
    helper.name = 'lightHelper'
    scene.add(helper)
}

function addLights(scene) {
    const ambientLight = new AmbientLight(0xffffff, 0.5)

    const directionalLight = new DirectionalLight(0xffffff, 1.5)
    directionalLight.name = 'light'
    directionalLight.position.set(-10, 30, 10)
    directionalLight.target.position.set(0, 0, 0)

    scene.add(ambientLight, directionalLight, directionalLight.target)
    addDirectionalLightHelper(scene, directionalLight)
}

export { addLights }
