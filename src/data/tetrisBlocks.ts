import { TetrisBlock } from '../types/game'

export const tetrisBlocks: Record<string, TetrisBlock> = {
  'base-led': {
    type: 'base-led',
    shape: [
      [1],
      [1],
      [1],
      [1],
      [1],
      [1]
    ],
    color: '#FF6B6B', // 赤色のベースLEDライト
    aspectRatio: '1:6',
    imagePath: '/src/assets/blocks/base-led.png' // PNGファイルのパスを追加
  },
  
  'downlight': {
    type: 'downlight',
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: '#4ECDC4', // 青色のダウンライト
    aspectRatio: '1:1', // 1:2から1:1に変更
    imagePath: '/src/assets/blocks/downlight.png' // PNGファイルのパスを追加
  },
  
  'square-light': {
    type: 'square-light',
    shape: [
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1]
    ],
    color: '#45B7D1', // 水色のスクエアライト
    aspectRatio: '1:1',
    imagePath: '/src/assets/blocks/square-light.png' // PNGファイルのパスを追加
  },

  'factory-light': {
    type: 'factory-light',
    shape: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1]
    ],
    color: '#96CEB4',
    aspectRatio: '1:2',
    imagePath: '/src/assets/blocks/factory-light.png' // PNGファイルのパスを追加
  },
}