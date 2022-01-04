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
    colour: randomiseColour(37, [60, 80], [30, 40]),
    action: false,
  },
  { 
    id: 1,
    type: 'Grass',
    orbs: true,
    colour: randomiseColour(120, [30, 40], [30,40]),
    action: false,
  },
  { 
    id: 2,
    type: 'Wind',
    orbs: true,
    colour: randomiseColour(120, [30, 40], [30,40]),
    action: 'wind',
  },
  { 
    id: 3,
    type: 'Sky',
    orbs: true,
    colour: randomiseColour(120, [30, 40], [30,40]),
    action: false
  },
  { 
    id: 4,
    type: 'Trees',
    orbs: true,
    colour: randomiseColour(120, [30, 40], [30,40]),
    action: false,
  },
  { 
    id: 5,
    type: 'Water',
    orbs: true,
    colour: randomiseColour(240, [30, 40], [30,40]),
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
    colour: randomiseColour(284, [30, 40], [40,50]),
    action: false,
  },
  { 
    id: 8,
    type: 'Grass',
    orbs: true,
    colour: randomiseColour(120, [30, 40], [40,50]),
    action: false,
  },
]