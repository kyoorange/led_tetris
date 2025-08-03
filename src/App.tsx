import { useState, useCallback } from 'react'
import './App.css'
import TetrisBoard from './components/TetrisBoard'
// import GameInfo from './components/GameInfo'
import { GameState} from './types/game'

// LED画像のインポート
import baseLedImage from './assets/blocks/base-led.png'
import downlightImage from './assets/blocks/downlight.png'
import squareLightImage from './assets/blocks/square-light.png'
import factoryLightImage from './assets/blocks/factory-light.png'

function App() {
  const [gameState, setGameState] = useState<GameState>('nicknameInput')
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [nickname, setNickname] = useState('')

  const handleNicknameSubmit = useCallback(() => {
    if (nickname.trim()) {
      setGameState('ruleExplanation')
    }
  }, [nickname])

  const startGame = useCallback(() => {
    setGameState('playing')
  }, [])

  const handleGameOver = useCallback(() => {
    setGameState('gameOver')
  }, [])

  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore)
  }, [])

  const handleLevelUpdate = useCallback((newLevel: number) => {
    setLevel(newLevel)
  }, [])

  const resetGame = useCallback(() => {
    setGameState('nicknameInput')
    setScore(0)
    setLevel(1)
    setNickname('')
  }, [])

  return (
    <div className="tetris-app">
      <header className="app-header">
        {/* <h1>LEDテトリス</h1> */}
      </header>

      {gameState === 'nicknameInput' && (
        <div className="nickname-input">
          <h2>ニックネームを入力</h2>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Hanako"
            maxLength={20}
          />
          <button
            onClick={handleNicknameSubmit}
            disabled={!nickname.trim()}
            className="start-button"
          >
            GO
          </button>
        </div>
      )}

      {gameState === 'ruleExplanation' && (
        <div className="rule-explanation">
          <div className="rules-content">
            <div className="rule-section">
              <h3>操作方法</h3>
              <ul>
                {/* <li>📱 <strong>タップ</strong>：ブロックを回転</li> */}
                <li>⬅️➡️ <strong>左右ボタン</strong>：左右移動</li>
                <li>⬇️ <strong>下ボタン</strong>：落下速度アップ</li>
                {/* <li>🔄 <strong>回転ボタン</strong>：ブロック回転</li> */}
              </ul>
            </div>
            <div className="rule-section">
              <h3>ゲームルール</h3>
              <ul>
                <li>⏬ ブロックが一つずつ落ちてきます</li>
                {/* <li>🐢 落下スピードは非常にゆっくりです</li> */}
                <li>🔄 落下中は移動が可能です（回転は未実装）</li>
                <li>📊 ライン消去でスコアアップ！</li>
                <li>💡 ときどき最高に理不尽です</li>
              </ul>
            </div>
            <div className="rule-section">
              <h3>LEDの種類</h3>
              <div className="led-types">
                <div className="led-item">
                  <img src={baseLedImage} alt="ベースLED" className="led-icon" />
                  <span>ベースライト</span>
                </div>
                <div className="led-item">
                  <img src={downlightImage} alt="ダウンライト" className="led-icon" />
                  <span>ダウンライト</span>
                </div>
                <div className="led-item">
                  <img src={squareLightImage} alt="スクエアライト" className="led-icon" />
                  <span>スクエアライト</span>
                </div>
                <div className="led-item">
                  <img src={factoryLightImage} alt="ファクトリーライト" className="led-icon" />
                  <span>高天井用ライト</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={startGame}
            className="start-button"
          >
            GO
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="game-container">
          <TetrisBoard
            gameState={gameState}
            onGameOver={handleGameOver}
            onScoreUpdate={handleScoreUpdate}
            onLevelUpdate={handleLevelUpdate}
          />
          {/* <GameInfo
            score={score}
            level={level}
            gameState={gameState}
            nickname={nickname}
          /> */}
        </div>
      )}

      {gameState === 'gameOver' && (
        <div className="game-over">
          <h2>ゲームオーバー</h2>
          <p>スコア: {score}</p>
          <p>レベル: {level}</p>
          <button onClick={resetGame} className="start-button">
            もう一度プレイ
          </button>
        </div>
      )}
    </div>
  )
}

export default App
