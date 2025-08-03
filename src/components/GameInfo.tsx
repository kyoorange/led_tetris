import React from 'react'
import { GameState } from '../types/game'
import { tetrisBlocks } from '../data/tetrisBlocks'
import './GameInfo.css'

interface GameInfoProps {
  score: number
  level: number
  gameState: GameState
  nickname: string
}

const GameInfo: React.FC<GameInfoProps> = ({
  score,
  level,
  gameState,
  nickname
}) => {
  const getGameStateText = () => {
    switch (gameState) {
      case 'waiting':
        return 'ゲーム開始待機中'
      case 'playing':
        return 'プレイ中'
      case 'paused':
        return '一時停止'
      case 'gameOver':
        return 'ゲームオーバー'
      default:
        return ''
    }
  }

  const renderBlockPreview = (blockType: string) => {
    const block = tetrisBlocks[blockType]
    if (!block) return null

    const shape = block.shape
    const maxWidth = Math.max(...shape.map(row => row.length))
    const maxHeight = shape.length

    return (
      <div 
        className="block-preview"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${maxWidth}, 8px)`,
          gridTemplateRows: `repeat(${maxHeight}, 8px)`,
          gap: '1px',
          width: `${maxWidth * 8 + (maxWidth - 1)}px`,
          height: `${maxHeight * 8 + (maxHeight - 1)}px`
        }}
      >
        {shape.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className="block-cell"
              style={{
                backgroundColor: cell ? block.color : 'transparent',
                width: '8px',
                height: '8px',
                borderRadius: '1px'
              }}
            />
          ))
        )}
      </div>
    )
  }

  return (
    <div className="game-info">
      <div className="player-info">
        <h3>プレイヤー: {nickname}</h3>
      </div>
      
      <div className="game-stats">
        <div className="stat-item">
          <label>スコア:</label>
          <span className="score">{score.toLocaleString()}</span>
        </div>
        
        <div className="stat-item">
          <label>レベル:</label>
          <span className="level">{level}</span>
        </div>
        
        <div className="stat-item">
          <label>状態:</label>
          <span className={`game-state ${gameState}`}>{getGameStateText()}</span>
        </div>
      </div>
      
      <div className="block-info">
        <h4>ブロックの種類</h4>
        <div className="block-types">
          {Object.entries(tetrisBlocks).map(([key, block]) => (
            <div key={key} className="block-type">
              {renderBlockPreview(key)}
              <div className="block-details">
                <span className="block-name">{getBlockDisplayName(key)}</span>
                <span className="block-ratio">{block.aspectRatio}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="instructions">
        <h4>📱 スマホ操作方法</h4>
        <ul>
          <li>🔄 <strong>回転ボタン</strong>：ブロックを回転</li>
          <li>⬅️➡️ <strong>左右ボタン</strong>：ブロックを移動</li>
          <li>⬇️ <strong>下ボタン</strong>：高速落下</li>
          <li>📱 <strong>ブロックタップ</strong>：直接回転</li>
        </ul>
      </div>
    </div>
  )
}

const getBlockDisplayName = (blockType: string): string => {
  const names: Record<string, string> = {
    'base-led': 'ベースLEDライト',
    'downlight': 'ダウンライト',
    'square-light': 'スクエアライト',
    'factory-light': '工場用高天井ライト'
  }
  return names[blockType] || blockType
}

export default GameInfo