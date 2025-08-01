import React from 'react'
import { GameState } from '../types/game'
import './GameInfo.css'

interface GameInfoProps {
  score: number
  level: number
  gameState: GameState
  nickname: string
  onReset: () => void
}

const GameInfo: React.FC<GameInfoProps> = ({
  score,
  level,
  gameState,
  nickname,
  onReset
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
      
      {gameState === 'gameOver' && (
        <div className="game-over">
          <h2>ゲームオーバー</h2>
          <p>最終スコア: {score.toLocaleString()}</p>
          <p>レベル: {level}</p>
          <button onClick={onReset} className="reset-button">
            もう一度プレイ
          </button>
        </div>
      )}
      
      <div className="instructions">
        <h4>遊び方</h4>
        <ul>
          <li>← → キーでブロックを移動</li>
          <li>↑ キーまたはスペースでブロックを回転</li>
          <li>↓ キーで高速落下</li>
          <li>ラインを揃えるとスコアアップ</li>
          <li>ブロックが天井に到達するとゲームオーバー</li>
        </ul>
      </div>
      
      <div className="block-info">
        <h4>ブロックの種類</h4>
        <div className="block-types">
          <div className="block-type">
            <div className="block-preview base-led"></div>
            <span>ベースLEDライト (1:6)</span>
          </div>
          <div className="block-type">
            <div className="block-preview downlight"></div>
            <span>ダウンライト (1:2)</span>
          </div>
          <div className="block-type">
            <div className="block-preview square-light"></div>
            <span>スクエアライト (4:4)</span>
          </div>
          <div className="block-type">
            <div className="block-preview factory-light"></div>
            <span>工場用高天井ライト (2:2)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameInfo