import { TetrisBlock } from '../types/game'

export const tetrisBlocks: Record<string, TetrisBlock> = {
  'base-led': {
    type: 'base-led',
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: '#FF6B6B', // 赤色のベースLEDライト
    aspectRatio: '1:1'
  },
  
  'downlight': {
    type: 'downlight',
    shape: [
      [1],
      [1]
    ],
    color: '#4ECDC4', // 青色のダウンライト
    aspectRatio: '1:2'
  },
  
  'square-light': {
    type: 'square-light',
    shape: [
      [1]
    ],
    color: '#45B7D1', // 水色のスクエアライト
    aspectRatio: '1:1'
  },
  
  'factory-light': {
    type: 'factory-light',
    shape: [
      [1],
      [1],
      [1],
      [1],
      [1],
      [1],
      [1],
      [1]
    ],
    color: '#96CEB4', // 緑色の工場用高天井ライト
    aspectRatio: '1:8'
  },
  
  // 追加のブロックタイプ（従来のテトリスブロックも含める）
  'I-block': {
    type: 'factory-light', // 工場用ライトとして扱う
    shape: [
      [1],
      [1],
      [1],
      [1]
    ],
    color: '#FFEAA7', // 黄色
    aspectRatio: '1:4'
  },
  
  'L-block': {
    type: 'downlight', // ダウンライトとして扱う
    shape: [
      [1, 0],
      [1, 0],
      [1, 1]
    ],
    color: '#DDA0DD', // 紫色
    aspectRatio: '1:2'
  },
  
  'T-block': {
    type: 'base-led', // ベースLEDとして扱う
    shape: [
      [1, 1, 1],
      [0, 1, 0]
    ],
    color: '#98D8C8', // ティール色
    aspectRatio: '1:1'
  },
  
  'Z-block': {
    type: 'square-light', // スクエアライトとして扱う
    shape: [
      [1, 1, 0],
      [0, 1, 1]
    ],
    color: '#F7DC6F', // 金色
    aspectRatio: '1:1'
  }
} 