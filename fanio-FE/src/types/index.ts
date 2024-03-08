export interface Quiz {
    id: string
    title: string
    description: string
    createdAt: Date
    creatorId: string
    questions: Question[]
}

export interface Question {
    id: string
    url: string
    addedAt: Date
    updatedAt: Date
    answer: string
    startOffset?: number
}