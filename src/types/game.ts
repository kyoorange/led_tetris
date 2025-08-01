export type GameState = 'waiting' | 'playing' | 'paused' | 'gameOver'

export type BlockType = 
  | 'base-led'      // ベースLEDライト (1:1)
  | 'downlight'     // ダウンライト (1:2)
  | 'square-light'  // スクエアライト (1:1)
  | 'factory-light' // 工場用高天井ライト (1:8)

export interface Block {
  type: BlockType
  x: number
  y: number
  rotation: number
  color: string
}

export interface GameBoard {
  width: number
  height: number
  grid: (Block | null)[][]
}

export interface GameStats {
  score: number
  level: number
  linesCleared: number
  blocksPlaced: number
}

export interface TetrisBlock {
  shape: number[][]
  color: string
  type: BlockType
  aspectRatio: '1:1' | '1:2' | '1:8'
} 