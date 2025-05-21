# The PID bee: simulation of bee flight with PID and Three.js
*2110514 Realtime Computer Graphics and Physics Simulation, Semester 2, Academic Year 2024 Chulalongkorn University*

The PID bee is a simulation that generates a natural-looking bee flight path. The scene contains a hive, bees, and flowers, to which the bee will go to get their honey and come back to the hive periodically. The list of adjustable parameters is shown below:
  - Ground size: the size of the ground
  - Number of flowers: as it said
  - Number of bees: as it said
  - PID scale: scale the constant in PID. Scale up or down makes the bee's response faster or slower. Can lead to instability if the value is too big.
  - Random movement scale: scale the $F_{random}$ magnitude. Can lead to instability if the value is too big.
  - Max propeller force: max propel force of the bee. Too small lead to uncontrollable bee, while too big can lead to instant acceleration (go from 0 m/s to 100 m/s in one frame)
  - Period of state change: the period of state change in bee
  - Wind strength: magnitude of the wind
  - Wind event duration: how long the wind last

## To run
- insall `three` and `vite` with this command
```
# three.js
npm install --save three

# vite
npm install --save-dev vite
```
- then, run a server with `npx vite`
