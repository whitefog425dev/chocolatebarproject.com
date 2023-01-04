export interface Maker {
  id: string
  name: MakerNames
}

const makers = [
  {
    id: '07ef0bfa14',
    name: 'Schoki Chocolate' as const,
  },
  {
    id: '5a1d356c26',
    name: 'Manoa Chocolate' as const,
  },
  {
    id: '37d76a0451',
    name: 'Olive & Sinclair Chocolate Co' as const,
  },
]

export type MakerNames = typeof makers[number]['name']

export default makers
