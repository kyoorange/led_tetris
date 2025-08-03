import React, { useState, useEffect, useCallback, useRef } from 'react'
import { GameState, Block, TetrisBlock,PlacedBlock, ObjectBasedGameBoard } from '../types/game'
import { tetrisBlocks } from '../data/tetrisBlocks'
import './TetrisBoard.css'

// PNGファイルのインポート
import baseLedImage from '../assets/blocks/base-led.png'
import downlightImage from '../assets/blocks/downlight.png'
import squareLightImage from '../assets/blocks/square-light.png'
import factoryLightImage from '../assets/blocks/factory-light.png'

// 画像マッピング
const blockImages: Record<string, string> = {
  'base-led': baseLedImage,
  'downlight': downlightImage,
  'square-light': squareLightImage,
  'factory-light': factoryLightImage,
}

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
  const [board, setBoard] = useState<ObjectBasedGameBoard>({
    width: BOARD_WIDTH,
    height: BOARD_HEIGHT,
    grid: Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null)),
    placedBlocks: []
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

  // オブジェクトベースアプローチ用のヘルパー関数
  const syncGridWithBlocks = useCallback((placedBlocks: PlacedBlock[]): (string | null)[][] => {
    const grid = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))
    
    placedBlocks.forEach(block => {
      block.cells.forEach(cell => {
        if (cell.y >= 0 && cell.y < BOARD_HEIGHT && cell.x >= 0 && cell.x < BOARD_WIDTH) {
          grid[cell.y][cell.x] = block.id
        }
      })
    })
    
    return grid
  }, [])

  const createPlacedBlock = useCallback((block: Block): PlacedBlock => {
    const tetrisBlock = tetrisBlocks[block.type]
    const cells: Array<{x: number, y: number}> = []
    
    for (let y = 0; y < tetrisBlock.shape.length; y++) {
      for (let x = 0; x < tetrisBlock.shape[y].length; x++) {
        if (tetrisBlock.shape[y][x]) {
          cells.push({
            x: block.x + x,
            y: block.y + y
          })
        }
      }
    }
    
    return {
      id: `${block.type}-${Date.now()}-${Math.random()}`,
      type: block.type,
      x: block.x,
      y: block.y,
      rotation: block.rotation,
      color: block.color,
      cells
    }
  }, [])

  // const findBlockById = useCallback((id: string): PlacedBlock | undefined => {
  //   return board.placedBlocks.find(block => block.id === id)
  // }, [board.placedBlocks])

  // 重力効果を適用してブロックを落とす
  const applyGravity = useCallback((blocks: PlacedBlock[]): PlacedBlock[] => {
    if (blocks.length === 0) return blocks
    
    // 一時的なグリッドを作成して重力をシミュレート
    const tempGrid = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))
    
    // ブロックをY座標の降順でソート（下から処理）
    const sortedBlocks = [...blocks].sort((a, b) => b.y - a.y)
    
    const finalBlocks: PlacedBlock[] = []
    
    sortedBlocks.forEach(block => {
      let canFall = true
      let fallDistance = 0
      
      // このブロックがどこまで落ちられるかを計算
      while (canFall) {
        const newCells = block.cells.map(cell => ({
          ...cell,
          y: cell.y + fallDistance + 1
        }))
        
        // 新しい位置で当たり判定をチェック
        const hasCollision = newCells.some(cell => {
          // グリッド外チェック
          if (cell.y >= BOARD_HEIGHT || cell.x < 0 || cell.x >= BOARD_WIDTH) {
            return true
          }
          
          // 他のブロックとの重複チェック
          if (cell.y >= 0 && tempGrid[cell.y][cell.x] !== null) {
            return true
          }
          
          return false
        })
        
        if (hasCollision) {
          canFall = false
        } else {
          fallDistance++
        }
      }
      
      // 最終的な位置でブロックを配置
      const finalBlock = {
        ...block,
        y: block.y + fallDistance,
        cells: block.cells.map(cell => ({
          ...cell,
          y: cell.y + fallDistance
        }))
      }
      
      // グリッドにブロックを配置
      finalBlock.cells.forEach(cell => {
        if (cell.y >= 0 && cell.y < BOARD_HEIGHT && cell.x >= 0 && cell.x < BOARD_WIDTH) {
          tempGrid[cell.y][cell.x] = block.id
        }
      })
      
      finalBlocks.push(finalBlock)
    })
    
    console.log(`Applied gravity to ${blocks.length} blocks`)
    return finalBlocks
  }, [])





  // ブロックをボードに配置できるかチェック
  const canPlaceBlock = useCallback((block: Block, newX: number, newY: number): boolean => {
    const tetrisBlock = tetrisBlocks[block.type]
    const rotatedShape = tetrisBlock.shape

    for (let y = 0; y < rotatedShape.length; y++) {
      for (let x = 0; x < rotatedShape[y].length; x++) {
        if (rotatedShape[y][x]) {
          const boardX = newX + x
          const boardY = newY + y

          // グリッド外チェック
          if (boardX < 0 || boardX >= BOARD_WIDTH || 
              boardY >= BOARD_HEIGHT) {
            return false
          }
          
          // 他のブロックとの重複チェック（グリッド内の場合のみ）
          if (boardY >= 0 && board.grid[boardY][boardX] !== null) {
            return false
          }
        }
      }
    }
    return true
  }, [board])



  // ブロックを移動
  const moveBlock = useCallback((dx: number, dy: number) => {
    if (!currentBlock) return false
    
    const newX = currentBlock.x + dx
    const newY = currentBlock.y + dy
    
    if (canPlaceBlock(currentBlock, newX, newY)) {
      setCurrentBlock({ ...currentBlock, x: newX, y: newY })
      return true
    }
    return false
  }, [currentBlock, canPlaceBlock])

    // ライン消去チェック（オブジェクトベースアプローチ）
  const checkLineClears = useCallback((grid: (string | null)[][], placedBlocks: PlacedBlock[]) => {
    let linesCleared = 0
    const newGrid = grid.map(row => [...row]) // 新しい配列を作成
    
    // 消去する行を特定
    const linesToClear: number[] = []
    for (let y = newGrid.length - 1; y >= 0; y--) {
      if (newGrid[y].every(cell => cell !== null)) {
        linesToClear.push(y)
      }
    }
    
    // 行を消去
    for (const lineY of linesToClear) {
      console.log(`Clearing line at y=${lineY}`)
      newGrid.splice(lineY, 1)
      newGrid.unshift(Array(BOARD_WIDTH).fill(null))
      linesCleared++
    }
    
    // 残ったブロックの座標を更新（消去された行より下にあるブロック）
    const updatedPlacedBlocks = placedBlocks.map(block => {
      let linesAbove = 0
      for (const clearedLine of linesToClear) {
        if (clearedLine < block.y) {
          linesAbove++
        }
      }
      
      if (linesAbove > 0) {
        // ブロックが消去された行より下にある場合、座標を更新
        return {
          ...block,
          y: block.y - linesAbove,
          cells: block.cells.map(cell => ({
            ...cell,
            y: cell.y - linesAbove
          }))
        }
      }
      return block
    })
    
    // 消去された行に含まれていたブロックを削除
    const blocksAfterClear = updatedPlacedBlocks.filter(block => {
      return !block.cells.some(cell => 
        linesToClear.some(clearedLine => 
          cell.y === clearedLine
        )
      )
    })
    
    // 重力効果を適用して残ったブロックをすべて落とす
    const finalPlacedBlocks = applyGravity(blocksAfterClear)
    
    // グリッドを再同期
    const finalGrid = syncGridWithBlocks(finalPlacedBlocks)
    
    if (linesCleared > 0) {
      console.log(`Cleared ${linesCleared} lines`)
      console.log('New grid after line clear:', finalGrid)
      
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

    // 新しいグリッドとブロックリストを返す
    return { finalGrid, finalPlacedBlocks, linesCleared }
  }, [score, level, onScoreUpdate, onLevelUpdate, syncGridWithBlocks])

    // ブロックを固定
  const placeBlock = useCallback(() => {
    if (!currentBlock) return
    
    console.log('Placing block:', currentBlock)
    
    // 新しいブロックオブジェクトを作成
    const newPlacedBlock = createPlacedBlock(currentBlock)
    
    // 新しいグリッドを作成
    const newGrid = board.grid.map(row => [...row])
    
    // ブロックの各セルをグリッドに配置
    newPlacedBlock.cells.forEach(cell => {
      if (cell.y >= 0 && cell.y < BOARD_HEIGHT && cell.x >= 0 && cell.x < BOARD_WIDTH) {
        newGrid[cell.y][cell.x] = newPlacedBlock.id
        console.log(`Placed at [${cell.y}][${cell.x}]:`, newPlacedBlock.id)
      }
    })
    
    // 新しいplacedBlocksリストを作成
    const newPlacedBlocks = [...board.placedBlocks, newPlacedBlock]
    
    // ライン消去チェック（更新されたグリッドで実行）
    const { finalGrid, finalPlacedBlocks} = checkLineClears(newGrid, newPlacedBlocks)
    
    console.log('Final grid after line clear:', finalGrid.map((row) => 
      row.map((cell) => cell || 'null').join(', ')
    ))
    
    // ボードの状態を更新
    setBoard({ ...board, grid: finalGrid, placedBlocks: finalPlacedBlocks })
    
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
    
    // 初期位置が有効かチェックし、必要に応じて調整
    let adjustedX = newBlock.x
    const adjustedY = newBlock.y
    
    // 左端にはみ出している場合
    if (adjustedX < 0) {
      adjustedX = 0
    }
    
    // 右端にはみ出している場合
    const blockWidth = nextBlockType.shape[0].length
    if (adjustedX + blockWidth > BOARD_WIDTH) {
      adjustedX = BOARD_WIDTH - blockWidth
    }
    
    const adjustedBlock = {
      ...newBlock,
      x: adjustedX,
      y: adjustedY
    }
    
    if (!canPlaceBlock(adjustedBlock, adjustedBlock.x, adjustedBlock.y)) {
      onGameOver()
      return
    }
    
    setCurrentBlock(adjustedBlock)
  }, [currentBlock, board, nextBlock, generateNewBlock, canPlaceBlock, checkLineClears, onGameOver, createPlacedBlock])

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
        case 'z':
        case 'Z':
          e.preventDefault()
          console.log('Rotation disabled')
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameState, currentBlock, moveBlock])

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
      
      // 初期位置が有効かチェックし、必要に応じて調整
      let adjustedX = newBlock.x
      const adjustedY = newBlock.y
      
      // 左端にはみ出している場合
      if (adjustedX < 0) {
        adjustedX = 0
      }
      
      // 右端にはみ出している場合
      const blockWidth = firstBlock.shape[0].length
      if (adjustedX + blockWidth > BOARD_WIDTH) {
        adjustedX = BOARD_WIDTH - blockWidth
      }
      
      const adjustedBlock = {
        ...newBlock,
        x: adjustedX,
        y: adjustedY
      }

      setCurrentBlock(adjustedBlock)
    }
  }, [gameState, currentBlock, generateNewBlock])

  // ボードのレンダリング
  const renderBoard = () => {
    return (
      <div className="board-grid">
        {board.grid.map((row, y) => (
          <div key={y} className="board-row">
            {row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className={`board-cell ${cell ? `block-${cell}` : ''}`}
                style={{
                  backgroundColor: 'transparent',
                  position: 'relative'
                }}
              />
            ))}
          </div>
        ))}

        {/* 現在のブロックを表示 */}
        {currentBlock && (() => {
          const tetrisBlock = tetrisBlocks[currentBlock.type]
          const rotatedShape = tetrisBlock.shape
          
          // 回転後の形状のサイズを使用（当たり判定と一致させる）
          const rotatedWidth = rotatedShape[0].length
          const rotatedHeight = rotatedShape.length
          
          return (
            <div
              className="current-block-overlay"
              style={{
                position: 'absolute',
                left: `${currentBlock.x * 25}px`,
                top: `${currentBlock.y * 25}px`,
                width: `${rotatedWidth * 25}px`,
                height: `${rotatedHeight * 25}px`,
                zIndex: 10,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
                src={blockImages[currentBlock.type]}
                alt={`${currentBlock.type} block`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  transform: `rotate(0deg)`,
                  transformOrigin: 'center'
                }}
              />
            </div>
          )
        })()}

                {/* 固定されたブロックを表示 */}
        {(() => {
          const blockElements: JSX.Element[] = []
          const renderedBlocks = new Set<string>()

          // placedBlocksからブロックをレンダリング
          board.placedBlocks.forEach(block => {
            if (renderedBlocks.has(block.id)) {
              console.log(`Skipping already rendered block: ${block.id}`)
              return
            }

            console.log(`Rendering block: ${block.id} at position [${block.x},${block.y}]`)
            renderedBlocks.add(block.id)

            // このブロックの形状を取得
            const tetrisBlock = tetrisBlocks[block.type]
            const rotatedShape = tetrisBlock.shape

            // 回転後の形状のサイズを使用
            const rotatedWidth = rotatedShape[0].length
            const rotatedHeight = rotatedShape.length

            console.log(`Rendering block at position: x=${block.x}, y=${block.y}`)
            console.log(`Rotated shape size: ${rotatedWidth}x${rotatedHeight}`)

            blockElements.push(
              <div
                key={`fixed-block-${block.id}`}
                className="fixed-block-overlay"
                style={{
                  position: 'absolute',
                  left: `${block.x * 25}px`,
                  top: `${block.y * 25}px`,
                  width: `${rotatedWidth * 25}px`,
                  height: `${rotatedHeight * 25}px`,
                  zIndex: 5,
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img
                  src={blockImages[block.type]}
                  alt={`${block.type} block`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    transform: `rotate(0deg)`,
                    transformOrigin: 'center'
                  }}
                />
              </div>
            )
          })

          return blockElements
        })()}
      </div>
    )
  }

  return (
    <div className="tetris-board">
      <div className="board-container">
        {renderBoard()}
      </div>
      <div className="mobile-controls">
        <button 
          className="control-button left-btn"
          onClick={() => moveBlock(-1, 0)}
          disabled={gameState !== 'playing'}
        >
          ⬅️
        </button>
        <button 
          className="control-button down-btn"
          onClick={() => moveBlock(0, 1)}
          disabled={gameState !== 'playing'}
        >
          ⬇️
        </button>
        <button 
          className="control-button right-btn"
          onClick={() => moveBlock(1, 0)}
          disabled={gameState !== 'playing'}
        >
          ➡️
        </button>
      </div>
      {/* <div className="game-controls">
        <p>⬅️➡️ 左右移動</p>
        <p>⬇️ 高速落下</p>
      </div> */}
    </div>
  )
}

export default TetrisBoard 