import { useState, useCallback } from 'react'
import './App.css'
import TetrisBoard from './components/TetrisBoard'
import GameInfo from './components/GameInfo'
import { GameState} from './types/game'

function App() {
  const [gameState, setGameState] = useState<GameState>('waiting')
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [nickname, setNickname] = useState('')
  const [showNicknameInput, setShowNicknameInput] = useState(true)

  const startGame = useCallback(() => {
    if (nickname.trim()) {
      setGameState('playing')
      setShowNicknameInput(false)
    }
  }, [nickname])

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
    setGameState('waiting')
    setScore(0)
    setLevel(1)
    setShowNicknameInput(true)
  }, [])

  return (
    <div className="tetris-app">
      <header className="app-header">
        <h1>LEDテトリス</h1>
        <p>照明器具モチーフのテトリスゲーム</p>
      </header>

      {showNicknameInput ? (
        <div className="nickname-input">
          <h2>ニックネームを入力してください</h2>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="ニックネーム"
            maxLength={20}
          />
          <button 
            onClick={startGame}
            disabled={!nickname.trim()}
            className="start-button"
          >
            GO
          </button>
        </div>
      ) : (
        <div className="game-container">
          <TetrisBoard
            gameState={gameState}
            onGameOver={handleGameOver}
            onScoreUpdate={handleScoreUpdate}
            onLevelUpdate={handleLevelUpdate}
          />
          <GameInfo
            score={score}
            level={level}
            gameState={gameState}
            nickname={nickname}
            onReset={resetGame}
          />
        </div>
      )}
    </div>
  )
}

export default App
