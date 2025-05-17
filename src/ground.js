import {
    PlaneGeometry,
    MeshPhongMaterial,
    DoubleSide,
    Mesh,
    BoxGeometry,
} from 'three'

function addGround(scene, planeSize) {
    const geometry = new PlaneGeometry(planeSize, planeSize)
    const material = new MeshPhongMaterial({ color: 0x2e3047 })
    const planeMesh = new Mesh(geometry, material)
    planeMesh.name = 'plane'
    planeMesh.rotation.x = Math.PI * -0.5
    scene.add(planeMesh)
}

export { addGround }
