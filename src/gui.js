import GUI from 'lil-gui'
import { MathUtils } from 'three'
import { config } from './config'
import { controller } from './controller'

function addGUI(scene) {
  const gui = new GUI()

  const restart = () => {

  }

  const windEventInitiate = () => {
    
  }

  const param = {
    restart: restart,
    mass: config.mass,
    maxPropellerForce: config.maxPropellerForce,
    numberOfBees: config.numberOfBees,
    numberOfFlowers: config.numberOfFlowers,
    groundSize: config.groundSize,
    pidValueScale: config.pidValueScale,
    randomMovementMagScale: config.randomMovementMagScale,
    aroundTargetRadiusScale: config.aroundTargetRadiusScale,
    stateChange: config.stateChange, 

    windEventInitiate: windEventInitiate,
    windStrength: config.windStrength,
    windEventDuration: config.windEventDuration

  }

  gui.add(param, 'restart')
    .name('Restart Simulation')
    .onChange(() => {
      controller.init();
    })

  gui.add(param, 'groundSize')
    .name('Ground size')
    .onChange(() => {
        config.groundSize = param.groundSize
    })

  gui.add(param, 'numberOfFlowers')
    .name('Number of flowers')
    .onChange(() => {
        config.numberOfFlowers = param.numberOfFlowers
    })

  gui.add(param, 'numberOfBees')
    .name('Number of bees')
    .onChange(() => {
        config.numberOfBees = param.numberOfBees
    })

  // gui.add(param, 'gravity', 1, 20)
  //   .name('Gravity (m/s2)')
  //   .onChange(() => {
  //       config.gravity = param.gravity
  //   })

  const bee_folder = gui.addFolder('Bee parameter')
  bee_folder.add(param, 'pidValueScale', 0, 2)
    .name('PID scale')
    .onChange(() => {
        config.pidValueScale = param.pidValueScale
        controller.update_config_value()
    })

  bee_folder.add(param, 'randomMovementMagScale', 1, 10)
    .name('Random movement scale')
    .onChange(() => {
        config.randomMovementMagScale = param.randomMovementMagScale
    })

  bee_folder.add(param, 'maxPropellerForce', 100, 1000)
    .name('Max propeller force')
    .onChange(() => {
        config.maxPropellerForce = param.maxPropellerForce
        controller.update_config_value()
    })

  bee_folder.add(param, 'stateChange')
    .name('Period of state change')
    .onChange(() => {
        config.stateChange = param.stateChange
        controller.update_config_period()
    })

  
  const wind_folder = gui.addFolder('Wind event')
  wind_folder
    .add(param, 'windEventInitiate')
    .name("Generate wind")
    .onChange(() => {
      controller.wind_event_initiate()
    })

  wind_folder
    .add(param, 'windStrength', 5, 50)
    .name("Wind strength")
    .onChange(() => {
      config.windStrength = param.windStrength
    })

  wind_folder
    .add(param, 'windEventDuration', 0.1, 3)
    .name('Wind event duration')
    .onChange(() => {
      config.windEventDuration = param.windEventDuration
    })
}

export { addGUI }
