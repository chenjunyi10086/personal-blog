<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">🎮 小游戏</h1>
      <p class="page-subtitle">轻松愉快的小游戏，放松心情</p>
    </div>

    <div class="card">
      <h2 class="card-title">🎯 游戏选择</h2>
      <div class="game-selector">
        <button 
          v-for="game in games" 
          :key="game.id"
          :class="['game-btn', { active: activeGame === game.id }]"
          @click="switchGame(game.id)"
        >
          {{ game.name }}
        </button>
      </div>
    </div>

    <!-- 2048游戏 -->
    <div v-if="activeGame === 'game2048'" class="card">
      <h2 class="card-title">🎮 2048</h2>
      <div class="game-container">
        <div class="game-header">
          <div class="score-board">
            <div class="score-item">
              <div class="score-label">得分</div>
              <div class="score-value">{{ score2048 }}</div>
            </div>
            <div class="score-item">
              <div class="score-label">最高分</div>
              <div class="score-value">{{ bestScore2048 }}</div>
            </div>
          </div>
          <button @click="init2048" class="restart-btn">重新开始</button>
        </div>
        <div class="game-board">
          <div 
            v-for="(row, rowIndex) in board2048" 
            :key="rowIndex"
            class="game-row"
          >
            <div 
              v-for="(cell, cellIndex) in row" 
              :key="cellIndex"
              :class="['game-cell', `cell-${cell}`]"
            >
              {{ cell || '' }}
            </div>
          </div>
        </div>
        <div class="game-instructions">
          <p>使用方向键或WASD键移动方块，相同数字的方块会合并成更大的数字！</p>
        </div>
      </div>
    </div>

    <!-- 贪吃蛇游戏 -->
    <div v-if="activeGame === 'snake'" class="card">
      <h2 class="card-title">🐍 贪吃蛇</h2>
      <div class="game-container">
        <div class="game-header">
          <div class="score-board">
            <div class="score-item">
              <div class="score-label">得分</div>
              <div class="score-value">{{ snakeScore }}</div>
            </div>
            <div class="score-item">
              <div class="score-label">长度</div>
              <div class="score-value">{{ snakeLength }}</div>
            </div>
          </div>
          <div class="game-controls">
            <button @click="startSnake" class="control-btn">{{ snakeRunning ? '暂停' : '开始' }}</button>
            <button @click="resetSnake" class="control-btn">重置</button>
          </div>
        </div>
        <div class="snake-board" ref="snakeBoard">
          <canvas ref="snakeCanvas" width="400" height="400"></canvas>
        </div>
        <div class="game-instructions">
          <p>使用方向键或WASD键控制贪吃蛇移动，吃到食物会增长身体！</p>
        </div>
      </div>
    </div>

    <!-- 记忆翻牌游戏 -->
    <div v-if="activeGame === 'memory'" class="card">
      <h2 class="card-title">🧠 记忆翻牌</h2>
      <div class="game-container">
        <div class="game-header">
          <div class="score-board">
            <div class="score-item">
              <div class="score-label">步数</div>
              <div class="score-value">{{ memoryMoves }}</div>
            </div>
            <div class="score-item">
              <div class="score-label">时间</div>
              <div class="score-value">{{ memoryTime }}秒</div>
            </div>
          </div>
          <button @click="initMemory" class="restart-btn">重新开始</button>
        </div>
        <div class="memory-board">
          <div 
            v-for="(card, index) in memoryCards" 
            :key="index"
            :class="['memory-card', { flipped: card.flipped, matched: card.matched }]"
            @click="flipCard(index)"
          >
            <div class="card-front">?</div>
            <div class="card-back">{{ card.emoji }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 打字速度游戏 -->
    <div v-if="activeGame === 'typing'" class="card">
      <h2 class="card-title">⌨️ 打字速度</h2>
      <div class="game-container">
        <div class="game-header">
          <div class="score-board">
            <div class="score-item">
              <div class="score-label">速度</div>
              <div class="score-value">{{ typingSpeed }} 字/分</div>
            </div>
            <div class="score-item">
              <div class="score-label">正确率</div>
              <div class="score-value">{{ typingAccuracy }}%</div>
            </div>
          </div>
          <button @click="startTyping" class="restart-btn">重新开始</button>
        </div>
        <div class="typing-game">
          <div class="text-display">
            <span 
              v-for="(char, index) in typingText" 
              :key="index"
              :class="['char', { 
                correct: typed[index] === char,
                incorrect: typed[index] && typed[index] !== char,
                current: index === typed.length
              }]"
            >
              {{ char }}
            </span>
          </div>
          <input 
            ref="typingInput"
            v-model="typed"
            type="text"
            class="typing-input"
            placeholder="开始输入..."
            @input="checkTyping"
            :disabled="typingFinished"
          />
        </div>
      </div>
    </div>

    <div class="card">
      <h2 class="card-title">📊 游戏统计</h2>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-number">{{ totalGamesPlayed }}</div>
          <div class="stat-label">游戏总次数</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ totalPlayTime }}</div>
          <div class="stat-label">游戏总时长(分)</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">🏆 {{ bestAchievement }}</div>
          <div class="stat-label">最佳成就</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Game',
  data() {
    return {
      activeGame: 'game2048',
      games: [
        { id: 'game2048', name: '2048' },
        { id: 'snake', name: '贪吃蛇' },
        { id: 'memory', name: '记忆翻牌' },
        { id: 'typing', name: '打字速度' }
      ],
      
      // 2048游戏数据
      board2048: [],
      score2048: 0,
      bestScore2048: 0,
      
      // 贪吃蛇游戏数据
      snakeScore: 0,
      snakeLength: 3,
      snakeRunning: false,
      snake: [],
      food: null,
      snakeDirection: 'right',
      snakeInterval: null,
      
      // 记忆游戏数据
      memoryCards: [],
      memoryMoves: 0,
      memoryTime: 0,
      memoryInterval: null,
      flippedCards: [],
      
      // 打字游戏数据
      typingText: 'The quick brown fox jumps over the lazy dog. 这是一个测试你打字速度的小游戏！',
      typed: '',
      typingStartTime: null,
      typingSpeed: 0,
      typingAccuracy: 100,
      typingFinished: false,
      
      // 统计数据
      totalGamesPlayed: 0,
      totalPlayTime: 0,
      bestAchievement: '2048: 2048分'
    }
  },
  mounted() {
    this.init2048()
    this.initMemory()
    this.startTyping()
    window.addEventListener('keydown', this.handleKeyPress)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeyPress)
    this.clearSnakeInterval()
    this.clearMemoryInterval()
  },
  methods: {
    switchGame(gameId) {
      this.activeGame = gameId
      if (gameId === 'snake') {
        this.resetSnake()
      }
    },
    
    // 2048游戏方法
    init2048() {
      this.board2048 = Array(4).fill().map(() => Array(4).fill(0))
      this.score2048 = 0
      this.addNewTile()
      this.addNewTile()
    },
    addNewTile() {
      const emptyCells = []
      this.board2048.forEach((row, i) => {
        row.forEach((cell, j) => {
          if (cell === 0) {
            emptyCells.push({ x: i, y: j })
          }
        })
      })
      if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)]
        this.board2048[randomCell.x][randomCell.y] = Math.random() > 0.9 ? 4 : 2
      }
    },
    move2048(direction) {
      const oldBoard = this.board2048.map(row => [...row])
      let moved = false
      
      if (direction === 'left' || direction === 'right') {
        this.board2048 = this.board2048.map(row => {
          const filtered = row.filter(val => val !== 0)
          const merged = []
          let skip = false
          
          for (let i = 0; i < filtered.length; i++) {
            if (skip) {
              skip = false
              continue
            }
            if (filtered[i] === filtered[i + 1]) {
              merged.push(filtered[i] * 2)
              this.score2048 += filtered[i] * 2
              skip = true
            } else {
              merged.push(filtered[i])
            }
          }
          
          while (merged.length < 4) {
            if (direction === 'left') {
              merged.push(0)
            } else {
              merged.unshift(0)
            }
          }
          
          return direction === 'left' ? merged : merged.reverse()
        })
      } else {
        for (let col = 0; col < 4; col++) {
          const column = this.board2048.map(row => row[col])
          const filtered = column.filter(val => val !== 0)
          const merged = []
          let skip = false
          
          for (let i = 0; i < filtered.length; i++) {
            if (skip) {
              skip = false
              continue
            }
            if (filtered[i] === filtered[i + 1]) {
              merged.push(filtered[i] * 2)
              this.score2048 += filtered[i] * 2
              skip = true
            } else {
              merged.push(filtered[i])
            }
          }
          
          while (merged.length < 4) {
            if (direction === 'up') {
              merged.push(0)
            } else {
              merged.unshift(0)
            }
          }
          
          const finalColumn = direction === 'up' ? merged : merged.reverse()
          finalColumn.forEach((val, row) => {
            this.board2048[row][col] = val
          })
        }
      }
      
      moved = !this.arraysEqual(oldBoard, this.board2048)
      if (moved) {
        this.addNewTile()
      }
      
      if (this.score2048 > this.bestScore2048) {
        this.bestScore2048 = this.score2048
      }
    },
    arraysEqual(a, b) {
      return a.every((row, i) => row.every((val, j) => val === b[i][j]))
    },
    
    // 贪吃蛇游戏方法
    startSnake() {
      if (!this.snakeRunning) {
        this.snakeRunning = true
        this.snakeInterval = setInterval(() => {
          this.moveSnake()
        }, 150)
      } else {
        this.pauseSnake()
      }
    },
    pauseSnake() {
      this.snakeRunning = false
      this.clearSnakeInterval()
    },
    resetSnake() {
      this.clearSnakeInterval()
      this.snake = [{ x: 10, y: 10 }]
      this.snakeDirection = 'right'
      this.snakeScore = 0
      this.snakeLength = 3
      this.snakeRunning = false
      this.generateFood()
      this.drawSnake()
    },
    clearSnakeInterval() {
      if (this.snakeInterval) {
        clearInterval(this.snakeInterval)
        this.snakeInterval = null
      }
    },
    moveSnake() {
      const head = { ...this.snake[0] }
      
      switch (this.snakeDirection) {
        case 'up': head.y--; break
        case 'down': head.y++; break
        case 'left': head.x--; break
        case 'right': head.x++; break
      }
      
      if (this.checkCollision(head)) {
        this.gameOver()
        return
      }
      
      this.snake.unshift(head)
      
      if (head.x === this.food.x && head.y === this.food.y) {
        this.snakeScore += 10
        this.snakeLength++
        this.generateFood()
      } else {
        if (this.snake.length > this.snakeLength) {
          this.snake.pop()
        }
      }
      
      this.drawSnake()
    },
    checkCollision(head) {
      return head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20 ||
             this.snake.some(segment => segment.x === head.x && segment.y === head.y)
    },
    generateFood() {
      do {
        this.food = {
          x: Math.floor(Math.random() * 20),
          y: Math.floor(Math.random() * 20)
        }
      } while (this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y))
    },
    drawSnake() {
      const canvas = this.$refs.snakeCanvas
      const ctx = canvas.getContext('2d')
      
      ctx.clearRect(0, 0, 400, 400)
      
      // 绘制蛇
      ctx.fillStyle = '#764ba2'
      this.snake.forEach(segment => {
        ctx.fillRect(segment.x * 20, segment.y * 20, 18, 18)
      })
      
      // 绘制食物
      ctx.fillStyle = '#ff6b6b'
      ctx.fillRect(this.food.x * 20, this.food.y * 20, 18, 18)
    },
    gameOver() {
      this.clearSnakeInterval()
      this.snakeRunning = false
      alert(`游戏结束！得分：${this.snakeScore}`)
    },
    
    // 记忆游戏方法
    initMemory() {
      const emojis = ['🎮', '🎯', '🎨', '🎭', '🎪', '🎬', '🎸', '🎹']
      const cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5)
      
      this.memoryCards = cards.map(emoji => ({
        emoji,
        flipped: false,
        matched: false
      }))
      
      this.memoryMoves = 0
      this.memoryTime = 0
      this.flippedCards = []
      
      this.clearMemoryInterval()
      this.memoryInterval = setInterval(() => {
        this.memoryTime++
      }, 1000)
    },
    clearMemoryInterval() {
      if (this.memoryInterval) {
        clearInterval(this.memoryInterval)
        this.memoryInterval = null
      }
    },
    flipCard(index) {
      const card = this.memoryCards[index]
      
      if (card.flipped || card.matched || this.flippedCards.length >= 2) {
        return
      }
      
      card.flipped = true
      this.flippedCards.push(index)
      this.memoryMoves++
      
      if (this.flippedCards.length === 2) {
        const [first, second] = this.flippedCards
        if (this.memoryCards[first].emoji === this.memoryCards[second].emoji) {
          this.memoryCards[first].matched = true
          this.memoryCards[second].matched = true
          this.flippedCards = []
          
          if (this.memoryCards.every(card => card.matched)) {
            this.clearMemoryInterval()
            setTimeout(() => {
              alert(`恭喜完成！用时${this.memoryTime}秒，移动${this.memoryMoves}次`)
            }, 500)
          }
        } else {
          setTimeout(() => {
            this.memoryCards[first].flipped = false
            this.memoryCards[second].flipped = false
            this.flippedCards = []
          }, 1000)
        }
      }
    },
    
    // 打字游戏方法
    startTyping() {
      this.typed = ''
      this.typingStartTime = Date.now()
      this.typingFinished = false
      this.typingSpeed = 0
      this.typingAccuracy = 100
      this.$nextTick(() => {
        this.$refs.typingInput?.focus()
      })
    },
    checkTyping() {
      if (this.typed.length >= this.typingText.length) {
        this.typingFinished = true
        const endTime = Date.now()
        const timeElapsed = (endTime - this.typingStartTime) / 1000 / 60
        this.typingSpeed = Math.round(this.typingText.length / timeElapsed)
      }
      
      // 计算正确率
      let correct = 0
      for (let i = 0; i < this.typed.length; i++) {
        if (this.typed[i] === this.typingText[i]) {
          correct++
        }
      }
      this.typingAccuracy = Math.round((correct / this.typed.length) * 100)
    },
    
    // 键盘事件处理
    handleKeyPress(e) {
      if (this.activeGame === 'game2048') {
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          e.preventDefault()
          this.move2048('up')
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          e.preventDefault()
          this.move2048('down')
        } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          e.preventDefault()
          this.move2048('left')
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          e.preventDefault()
          this.move2048('right')
        }
      } else if (this.activeGame === 'snake' && this.snakeRunning) {
        if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && this.snakeDirection !== 'down') {
          e.preventDefault()
          this.snakeDirection = 'up'
        } else if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && this.snakeDirection !== 'up') {
          e.preventDefault()
          this.snakeDirection = 'down'
        } else if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && this.snakeDirection !== 'right') {
          e.preventDefault()
          this.snakeDirection = 'left'
        } else if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && this.snakeDirection !== 'left') {
          e.preventDefault()
          this.snakeDirection = 'right'
        }
      }
    }
  }
}
</script>

<style scoped>
.game-selector {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.game-btn {
  padding: 1rem 2rem;
  border: none;
  background: #f8f9fa;
  color: #666;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.game-btn:hover {
  background: #e9ecef;
}

.game-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.game-container {
  max-width: 600px;
  margin: 0 auto;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.score-board {
  display: flex;
  gap: 2rem;
}

.score-item {
  text-align: center;
}

.score-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.3rem;
}

.score-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #764ba2;
}

.restart-btn, .control-btn {
  padding: 0.8rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.restart-btn:hover, .control-btn:hover {
  transform: translateY(-2px);
}

.game-controls {
  display: flex;
  gap: 1rem;
}

/* 2048游戏样式 */
.game-board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  background: #bbada0;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.game-row {
  display: contents;
}

.game-cell {
  width: 80px;
  height: 80px;
  background: #cdc1b4;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  color: #776e65;
}

.cell-2 { background: #eee4da; color: #776e65; }
.cell-4 { background: #ede0c8; color: #776e65; }
.cell-8 { background: #f2b179; color: #f9f6f2; }
.cell-16 { background: #f59563; color: #f9f6f2; }
.cell-32 { background: #f67c5f; color: #f9f6f2; }
.cell-64 { background: #f65e3b; color: #f9f6f2; }
.cell-128 { background: #edcf72; color: #f9f6f2; font-size: 1.5rem; }
.cell-256 { background: #edcc61; color: #f9f6f2; font-size: 1.5rem; }
.cell-512 { background: #edc850; color: #f9f6f2; font-size: 1.5rem; }
.cell-1024 { background: #edc53f; color: #f9f6f2; font-size: 1.2rem; }
.cell-2048 { background: #edc22e; color: #f9f6f2; font-size: 1.2rem; }

/* 贪吃蛇游戏样式 */
.snake-board {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

#snakeCanvas {
  border: 2px solid #764ba2;
  border-radius: 8px;
}

/* 记忆游戏样式 */
.memory-board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  max-width: 400px;
  margin: 0 auto;
}

.memory-card {
  width: 80px;
  height: 80px;
  position: relative;
  cursor: pointer;
  transform-style: preserve-3d;
  transition: transform 0.6s;
}

.memory-card.flipped {
  transform: rotateY(180deg);
}

.memory-card.matched {
  opacity: 0.6;
  cursor: default;
}

.card-front, .card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 2rem;
}

.card-front {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.card-back {
  background: white;
  border: 2px solid #764ba2;
  transform: rotateY(180deg);
}

/* 打字游戏样式 */
.typing-game {
  max-width: 800px;
  margin: 0 auto;
}

.text-display {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  font-size: 1.2rem;
  line-height: 1.8;
  margin-bottom: 1rem;
  font-family: 'Courier New', monospace;
}

.char {
  position: relative;
}

.char.correct {
  color: #28a745;
  background: rgba(40, 167, 69, 0.1);
}

.char.incorrect {
  color: #dc3545;
  background: rgba(220, 53, 69, 0.1);
}

.char.current {
  background: rgba(118, 75, 162, 0.3);
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { background: rgba(118, 75, 162, 0.3); }
  51%, 100% { background: transparent; }
}

.typing-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1.1rem;
  font-family: 'Courier New', monospace;
}

.typing-input:focus {
  outline: none;
  border-color: #764ba2;
}

.game-instructions {
  text-align: center;
  color: #666;
  margin-top: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.stat-item {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .game-cell {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }
  
  .memory-board {
    grid-template-columns: repeat(3, 1fr);
    max-width: 300px;
  }
  
  .memory-card {
    width: 70px;
    height: 70px;
  }
  
  .text-display {
    font-size: 1rem;
    padding: 1rem;
  }
}
</style>