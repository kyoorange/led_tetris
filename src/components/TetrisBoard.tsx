import React, { useState, useEffect, useCallback, useRef } from 'react'
import { GameState, Block, TetrisBlock, GameBoard } from '../types/game'
import { tetrisBlocks } from '../data/tetrisBlocks'
import './TetrisBoard.css'

interface TetrisBoardProps {
  gameState: GameState
  onGameOver: () => void
  onScoreUpdate: (score: number) => void
  onLevelUpdate: (level: number) => void
}

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const INITIAL_FALL_SPEED = 1000

const TetrisBoard: React.FC<TetrisBoardProps> = ({
  gameState,
  onGameOver,
  onScoreUpdate,
  onLevelUpdate
}) => {
  const [board, setBoard] = useState<GameBoard>({
    width: BOARD_WIDTH,
    height: BOARD_HEIGHT,
    grid: Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))
  })
  const [currentBlock, setCurrentBlock] = useState<Block | null>(null)
  const [nextBlock, setNextBlock] = useState<TetrisBlock | null>(null)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [fallSpeed, setFallSpeed] = useState(INITIAL_FALL_SPEED)
  const fallIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 新しいブロックを生成
  const generateNewBlock = useCallback((): TetrisBlock => {
    const blockTypes = Object.keys(tetrisBlocks) as Array<keyof typeof tetrisBlocks>
    const randomType = blockTypes[Math.floor(Math.random() * blockTypes.length)]
    return tetrisBlocks[randomType]
  }, [])

  // ブロックをボードに配置できるかチェック
  const canPlaceBlock = useCallback((block: Block, newX: number, newY: number, newRotation: number = block.rotation): boolean => {
    const tetrisBlock = tetrisBlocks[block.type]
    const rotatedShape = rotateShape(tetrisBlock.shape, newRotation)
    
    for (let y = 0; y < rotatedShape.length; y++) {
      for (let x = 0; x < rotatedShape[y].length; x++) {
        if (rotatedShape[y][x]) {
          const boardX = newX + x
          const boardY = newY + y
          
          if (boardX < 0 || boardX >= BOARD_WIDTH || 
              boardY >= BOARD_HEIGHT ||
              (boardY >= 0 && board.grid[boardY][boardX] !== null)) {
            return false
          }
        }
      }
    }
    return true
  }, [board])

  // シェイプを回転
  const rotateShape = useCallback((shape: number[][], rotation: number): number[][] => {
    let rotated = [...shape]
    for (let i = 0; i < rotation; i++) {
      const newShape = rotated[0].map((_, index) => 
        rotated.map(row => row[index]).reverse()
      )
      rotated = newShape
    }
    return rotated
  }, [])

  // ブロックを回転
  const rotateBlock = useCallback(() => {
    if (!currentBlock) return
    
    const newRotation = (currentBlock.rotation + 1) % 4
    if (canPlaceBlock(currentBlock, currentBlock.x, currentBlock.y, newRotation)) {
      setCurrentBlock({ ...currentBlock, rotation: newRotation })
    }
  }, [currentBlock, canPlaceBlock])

  // ブロックを移動
  const moveBlock = useCallback((dx: number, dy: number) => {
    if (!currentBlock) return
    
    const newX = currentBlock.x + dx
    const newY = currentBlock.y + dy
    
    if (canPlaceBlock(currentBlock, newX, newY)) {
      setCurrentBlock({ ...currentBlock, x: newX, y: newY })
      return true
    }
    return false
  }, [currentBlock, canPlaceBlock])

  // ブロックを固定
  const placeBlock = useCallback(() => {
    if (!currentBlock) return
    
    const newGrid = board.grid.map(row => [...row])
    const tetrisBlock = tetrisBlocks[currentBlock.type]
    const rotatedShape = rotateShape(tetrisBlock.shape, currentBlock.rotation)
    
    for (let y = 0; y < rotatedShape.length; y++) {
      for (let x = 0; x < rotatedShape[y].length; x++) {
        if (rotatedShape[y][x]) {
          const boardX = currentBlock.x + x
          const boardY = currentBlock.y + y
          if (boardY >= 0) {
            newGrid[boardY][boardX] = currentBlock
          }
        }
      }
    }
    
    setBoard({ ...board, grid: newGrid })
    
    // ライン消去チェック
    checkLineClears(newGrid)
    
    // 次のブロックを生成
    const nextBlockType = nextBlock || generateNewBlock()
    setNextBlock(generateNewBlock())
    
    const newBlock: Block = {
      type: nextBlockType.type,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(nextBlockType.shape[0].length / 2),
      y: 0,
      rotation: 0,
      color: nextBlockType.color
    }
    
    if (!canPlaceBlock(newBlock, newBlock.x, newBlock.y)) {
      onGameOver()
      return
    }
    
    setCurrentBlock(newBlock)
  }, [currentBlock, board, nextBlock, generateNewBlock, canPlaceBlock, rotateShape, onGameOver])

  // ライン消去チェック
  const checkLineClears = useCallback((grid: (Block | null)[][]) => {
    let linesCleared = 0
    
    for (let y = grid.length - 1; y >= 0; y--) {
      if (grid[y].every(cell => cell !== null)) {
        grid.splice(y, 1)
        grid.unshift(Array(BOARD_WIDTH).fill(null))
        linesCleared++
        y++ // 同じ行を再チェック
      }
    }
    
    if (linesCleared > 0) {
      const newScore = score + (linesCleared * 100 * level)
      setScore(newScore)
      onScoreUpdate(newScore)
      
      // レベルアップ
      const newLevel = Math.floor(newScore / 1000) + 1
      if (newLevel > level) {
        setLevel(newLevel)
        onLevelUpdate(newLevel)
        setFallSpeed(Math.max(500, INITIAL_FALL_SPEED - (newLevel - 1) * 100))
      }
    }
  }, [score, level, onScoreUpdate, onLevelUpdate])

  // キーボードイベント処理
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState !== 'playing' || !currentBlock) return
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          moveBlock(-1, 0)
          break
        case 'ArrowRight':
          e.preventDefault()
          moveBlock(1, 0)
          break
        case 'ArrowDown':
          e.preventDefault()
          moveBlock(0, 1)
          break
        case 'ArrowUp':
        case ' ':
          e.preventDefault()
          rotateBlock()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameState, currentBlock, moveBlock, rotateBlock])

  // 自動落下
  useEffect(() => {
    if (gameState !== 'playing') {
      if (fallIntervalRef.current) {
        clearInterval(fallIntervalRef.current)
        fallIntervalRef.current = null
      }
      return
    }

    fallIntervalRef.current = setInterval(() => {
      if (!moveBlock(0, 1)) {
        placeBlock()
      }
    }, fallSpeed)

    return () => {
      if (fallIntervalRef.current) {
        clearInterval(fallIntervalRef.current)
      }
    }
  }, [gameState, fallSpeed, moveBlock, placeBlock])

  // ゲーム開始時の初期化
  useEffect(() => {
    if (gameState === 'playing' && !currentBlock) {
      const firstBlock = generateNewBlock()
      setNextBlock(generateNewBlock())
      
      const newBlock: Block = {
        type: firstBlock.type,
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(firstBlock.shape[0].length / 2),
        y: 0,
        rotation: 0,
        color: firstBlock.color
      }
      
      setCurrentBlock(newBlock)
    }
  }, [gameState, currentBlock, generateNewBlock])

  // ボードのレンダリング
  const renderBoard = () => {
    const displayGrid = board.grid.map(row => [...row])
    
    // 現在のブロックを表示用グリッドに追加
    if (currentBlock) {
      const tetrisBlock = tetrisBlocks[currentBlock.type]
      const rotatedShape = rotateShape(tetrisBlock.shape, currentBlock.rotation)
      
      for (let y = 0; y < rotatedShape.length; y++) {
        for (let x = 0; x < rotatedShape[y].length; x++) {
          if (rotatedShape[y][x]) {
            const boardX = currentBlock.x + x
            const boardY = currentBlock.y + y
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayGrid[boardY][boardX] = currentBlock
            }
          }
        }
      }
    }
    
    return displayGrid.map((row, y) => (
      <div key={y} className="board-row">
        {row.map((cell, x) => (
          <div
            key={`${x}-${y}`}
            className={`board-cell ${cell ? `block-${cell.type}` : ''}`}
            style={{
              backgroundColor: cell ? cell.color : 'transparent'
            }}
          />
        ))}
      </div>
    ))
  }

  return (
    <div className="tetris-board">
      <div className="board-container">
        {renderBoard()}
      </div>
      <div className="game-controls">
        <p>← → : 移動</p>
        <p>↑ または スペース : 回転</p>
        <p>↓ : 高速落下</p>
      </div>
    </div>
  )
}

export default TetrisBoard 