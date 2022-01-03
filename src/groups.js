function randomiseColour (range) {
  console.log('colour setting')
  const h = 240;
  const s = Math.floor(Math.random() * 100);
  const l = Math.floor(Math.random() * 100);
  let color = { h, s, l }
  return color
}

const Groups = [ 
  { 
    id: 0,
    type: 'Mud',
    colour: randomiseColour(),
  },
  { 
    id: 1,
    type: 'Grass',
    colour: randomiseColour(),
  },
  { 
    id: 2,
    type: 'Wind',
    colour: randomiseColour(),
  },
  { 
    id: 3,
    type: 'Sky',
    colour: randomiseColour(),
  },
  { 
    id: 4,
    type: 'Trees',
    colour: randomiseColour(),
  },
  { 
    id: 5,
    type: 'Water',
    colour: randomiseColour(),
  },
  { 
    id: 6,
    type: 'Animals',
    colour: randomiseColour(),
  },
  { 
    id: 7,
    type: 'Flowers',
    colour: randomiseColour(),
  },
  { 
    id: 8,
    type: 'Grass',
    colour: randomiseColour(),
  },
]

export default { Groups }