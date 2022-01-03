//////////////////////////////////////
// SCENE SETTINGS                  //
////////////////////////////////////

const sceneDefault = { 
  fog: 0.1,
  boundary: 5,
  testing: true
} 

const sceneTest = { 
  fog: 0,
  boundary: 5,
  testing: false
} 

//////////////////////////////////////
// DEFAULT SETTINGS                //
////////////////////////////////////

const defaultParams = { 
  size: 0.45,
  height: 64,
  width: 32,
} 

const testParams = { 
  size: 0.45,
  height: 100,
  width: 32,
} 

//////////////////////////////////////
// BLOOM SETTINGS                  //
////////////////////////////////////

const bloomDefault = { 
  exposure: 10,
  bloomStrength: 8,
  bloomThreshold: -2,
  bloomRadius: 1
}

const bloomTest = { 
  exposure: 0,
  bloomStrength: 0,
  bloomThreshold: 0,
  bloomRadius: 0
}

//////////////////////////////////////
// EXPORTED CONFIGS                //
////////////////////////////////////

export let config = {
  current: { ...defaultParams },
  set testing (testing) {
    if (testing) {
      console.log(defaultParams)
      // config.current.size = testParams.size
      // config.current.height = testParams.height
      // config.current.width = testParams.width
      config.current.fog = testParams.fog
      config.current.boundary = testParams.boundary
     
      console.log(defaultParams)
    } else {
      console.log(defaultParams)
      config.current.size = defaultParams.size
      config.current.height = defaultParams.height
      config.current.width = defaultParams.width
      config.current.fog = defaultParams.fog
      config.current.boundary = defaultParams.boundary
      console.log(defaultParams)
    }
  }
}

export let bloom = { 
  current: { ...bloomDefault },
  set testing (testing) {
    if (testing) {
      bloom.current.bloomStrength = bloomTest.bloomStrength
      bloom.current.bloomThreshold = bloomTest.bloomThreshold
      bloom.current.bloomRadius = bloomTest.bloomRadius
    } else {
      bloom.current.bloomStrength = bloomDefault.bloomStrength
      bloom.current.bloomThreshold = bloomDefault.bloomThreshold
      bloom.current.bloomRadius = bloomDefault.bloomRadius
    }
  }
}

export let sceneSettings = { 
  current: { ...sceneDefault },
  set testing (testing) {
    if (testing) {
      sceneSettings.current.fog = sceneTest.fog
      sceneSettings.current.boundary = sceneTest.boundary
    } else {
      sceneSettings.current.fog = sceneDefault.fog
      sceneSettings.current.boundary = sceneDefault.boundary
    }
  }
}
