interface Subject {
  name: string
  description: string
  tags: string[]
  episodes: Episode[]
}

interface Episode {
  title: string
  description: string
  content: string
}