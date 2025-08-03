export type GameState = 'nicknameInput' | 'ruleExplanation' | 'waiting' | 'playing' | 'paused' | 'gameOver'

export type BlockType =
  | 'base-led'
  | 'downlight'
  | 'square-light'
  | 'factory-light'

export interface Block {
  type: BlockType
  x: number
  y: number
  rotation: number
  color: string
}

// 新しいオブジェクトベースアプローチ用の型定義
export interface PlacedBlock {
  id: string
  type: BlockType
  x: number
  y: number
  rotation: number
  color: string
  cells: Array<{x: number, y: number}> // このブロックが占めるセル
}

export interface GameBoard {
  width: number
  height: number
  grid: (Block | null)[][]
}

// 新しいオブジェクトベースアプローチ用のゲームボード
export interface ObjectBasedGameBoard {
  width: number
  height: number
  grid: (string | null)[][] // ブロックIDまたはnull
  placedBlocks: PlacedBlock[]
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
  aspectRatio: '1:1' | '1:2' | '1:4' | '1:6'
  imagePath?: string // PNGファイルのパス（オプショナル）
}