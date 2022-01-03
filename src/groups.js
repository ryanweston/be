import { randomInteger } from './controls'


function randomiseColour (hVal, sRange, lRange) {
  console.log('colour setting')
  const h = hVal;
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
    sound: false,
    colour: randomiseColour(37, [60, 80], [30, 40]),
    action: false,
  },
  { 
    id: 1,
    type: 'Grass',
    orbs: true,
    sound: false,
    colour: randomiseColour(120, [30, 40], [30,40]),
    action: false,
  },
  { 
    id: 2,
    type: 'Wind',
    orbs: false,
    sound: false,
    action: false,
  },
  { 
    id: 3,
    type: 'Sky',
    orbs: false,
    sound: false,
    action: 'setBackground'
  },
  { 
    id: 4,
    type: 'Trees',
    orbs: false,
    sound: false,
    action: false,
  },
  { 
    id: 5,
    type: 'Water',
    orbs: true,
    sound: false,
    colour: randomiseColour(240, [30, 40], [30,40]),
    action: false,
  },
  { 
    id: 6,
    type: 'Animals',
    orbs: false,
    sound: false,
    action: false,
  },
  { 
    id: 7,
    type: 'Flowers',
    orbs: true,
    sound: false,
    colour: randomiseColour(284, [30, 40], [40,50]),
    action: false,
  },
  { 
    id: 8,
    type: 'Grass',
    orbs: true,
    sound: false,
    colour: randomiseColour(120, [30, 40], [40,50]),
    action: false,
  },
]