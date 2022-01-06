import { randomInteger } from './controls'


function randomiseColour (hRange, sRange, lRange) {
  const h = randomInteger(hRange[0], hRange[1])
  const s = randomInteger(sRange[0], sRange[1])
  const l = randomInteger(lRange[0], lRange[1])
  let color = 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
  return color
}

export const Groups = [ 
  { 
    id: 0,
    type: 'Mud',
    orbs: true,
    colour: () => randomiseColour([20,30], [60, 70], [10, 15]),
    action: false,
  },
  { 
    id: 1,
    type: 'Grass',
    orbs: true,
    colour: () => randomiseColour([125,135], [20, 30], [15,25]),
    action: false,
  },
  { 
    id: 2,
    type: 'Wind',
    orbs: false,
    action: 'wind',
  },
  { 
    id: 3,
    type: 'Sky',
    orbs: true,
    colour: () => randomiseColour([170, 190], [50, 70], [50,70]),
    action: false
  },
  { 
    id: 4,
    type: 'Trees',
    orbs: true,
    colour: () => randomiseColour([120, 130], [30, 40], [30,40]),
    action: false,
  },
  { 
    id: 5,
    type: 'Water',
    orbs: true,
    colour: () => randomiseColour([220, 225], [70, 80], [30,50]),
    action: 'water',
  },
  { 
    id: 6,
    type: 'Birds',
    orbs: false,
    sound: true,
    action: 'birds',
  },
  { 
    id: 7,
    type: 'Flowers',
    orbs: true,
    colour: () => randomiseColour([0,359], [50, 80], [50,60]),
    action: false,
  },
  { 
    id: 8,
    type: 'Grass',
    orbs: true,
    colour: () => randomiseColour([120, 140], [30, 40], [30,50]),
    action: false,
  },
]