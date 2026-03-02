<template>
  <div class="container">
    <h2>🎴 打牌计分工具</h2>

    <!-- 操作区 -->
    <div class="top-bar">
      <el-input
        v-model="newName"
        placeholder="输入玩家名称"
        style="width: 200px"
      />
      <el-button type="primary" @click="addPlayer">添加玩家</el-button>

      <el-button type="success" @click="addDefaultPlayers">
        快捷添加默认玩家
      </el-button>

      <el-button type="danger" @click="resetGame">
        重新一局
      </el-button>

      <!-- 开始结算按钮（非结算模式显示） -->
      <el-button
        type="warning"
        @click="startSettle"
      >
        开始结算
      </el-button>
    </div>

    <!-- 汇率输入（仅结算模式显示） -->
    <div v-if="settleMode" class="rate-box">
      <el-input-number
        v-model="moneyPerUnit"
        :min="1"
        label="钱数"
        placeholder="每 X 元"
      /> 元 =
      <el-input-number
        v-model="pointsPerUnit"
        :min="1"
        label="积分"
        placeholder="多少分"
      /> 分
    </div>

    <!-- 玩家区域 -->
    <div class="player-list">
      <el-card
        v-for="(player, index) in players"
        :key="index"
        class="player-card"
      >
        <div class="name">{{ player.name }}</div>

        <!-- 普通打分模式 -->
        <div class="score" v-if="!settleMode">
          <el-button @click="changeScore(player, -1)">-</el-button>
          <span class="number">{{ player.score }}</span>
          <el-button type="success" @click="changeScore(player, 1)">+</el-button>
        </div>

        <!-- 结算模式：手分输入 -->
        <div class="settle-input" v-else>
          <el-input-number
            :step="100"
            v-model="player.currentScore"
            :min="0"
            placeholder="当前手分"
            style="width: 120px"
          />
        </div>

        <!-- 玩家离开按钮 -->
        <el-button
          type="danger"
          size="small"
          style="margin-top: 10px"
          @click="removePlayer(index)"
        >
          百万撤离
        </el-button>
      </el-card>
    </div>

    <!-- 一键结算按钮（仅结算模式显示） -->
    <div v-if="settleMode" class="settle-action">
      <el-button
        type="primary"
        @click="calculate"
        :disabled="!canCalculate"
      >
        一键结算
      </el-button>
    </div>

    <!-- 结算结果显示 -->
    <div v-if="results.length" class="results">
      <h3>结算结果</h3>
      <ul>
        <li v-for="r in results" :key="r.name">
          {{ r.name }} ： {{ r.amount }} 元
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue"

// --------------------
// 玩家数据
// --------------------
const players = ref([])
const newName = ref("")

// 默认玩家列表
const defaultPlayers = [
  "Xander",
  "老Jack",
  "Datou",
  "Parker",
  "Myron",
  "Kimmy",
  "Card",
  "Turtle",
  "提莫",
  "百里",
  "小Q",
  "Motor",
  "Azu",
]

// 读取 localStorage
onMounted(() => {
  const data = localStorage.getItem("players")
  if (data) {
    players.value = JSON.parse(data)
  }
})

// 自动保存
watch(
  players,
  (val) => {
    localStorage.setItem("players", JSON.stringify(val))
  },
  { deep: true }
)

// --------------------
// 添加/删除玩家
// --------------------
function addPlayer() {
  if (!newName.value.trim()) return
  players.value.push({
    name: newName.value,
    score: 0,
    currentScore: 0, // 用于结算
  })
  newName.value = ""
}

function addDefaultPlayers() {
  if (players.value.length > 0) return
  players.value = defaultPlayers.map((name) => ({
    name,
    score: 0,
    currentScore: 0,
  }))
}

function removePlayer(index) {
  players.value.splice(index, 1)
}

// --------------------
// 修改分数
// --------------------
function changeScore(player, amount) {
  player.score += amount
}

// --------------------
// 重新一局
// --------------------
function resetGame() {
  players.value = []
  localStorage.removeItem("players")
  results.value = []
  settleMode.value = false
}

// --------------------
// 结算功能
// --------------------
const settleMode = ref(false)
const results = ref([])

// 默认汇率
const moneyPerUnit = ref(10)
const pointsPerUnit = ref(1000)

// 开始结算
function startSettle() {
  players.value.forEach(p => {
    if (p.currentScore === undefined) p.currentScore = 0
    if (p.score === undefined) p.score = 0
  })

    // 计算现有玩家总 score
  const totalScore = players.value.reduce((sum, p) => sum + p.score, 0)

  if (totalScore > 0) {
    ElMessage.warning("当前借贷不处于零和，有人「借款」没有修改借款配置")
    return
  }

  if (totalScore < 0) {
    ElMessage.warning("当前借贷不处于零和，有人「贷款」没有修改借款配置")
    return
  }

  results.value = []
  settleMode.value = !settleMode.value
}

// 是否可以结算：每人都有 currentScore
const canCalculate = computed(() =>
  players.value.length > 0 &&
  players.value.every(p => p.currentScore !== null && p.currentScore !== undefined)
)

// 一键结算
function calculate() {
  if (!canCalculate.value) return
  results.value = []

  players.value.forEach(p => {
    const baseScore = pointsPerUnit.value // 底池默认
    // 总分 = 当前手分 + 底池 - 借贷分数
    const totalScore = p.currentScore + (p.score * baseScore)
    // 换算成钱"
    const amount = ((totalScore - baseScore) / pointsPerUnit.value) * moneyPerUnit.value
    results.value.push({
      name: p.name,
      amount: amount.toFixed(2),
    })
  })
}
</script>
<style scoped>
.container {
  padding: 20px;
  text-align: center;
}

/* 操作区 */
.top-bar {
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

/* 玩家区域 */
.player-list {
  display: flex;
  flex-wrap: wrap;          
  justify-content: center;  
  gap: 20px;
}

/* 玩家卡片 */
.player-card {
  width: 180px;
  text-align: center;
}

.name {
  font-weight: bold;
  margin-bottom: 10px;
}

.score {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.number {
  font-size: 26px;
  width: 40px;
  text-align: center;
}

/* -------------------- */
/* 结算模式样式 */
/* -------------------- */
.settle-section {
  margin-top: 30px;
  text-align: center;
}

.settle-input {
  margin-top: 10px;
  display: flex;
  justify-content: center;
}

.settle-action {
  margin-top: 15px;
}

.results {
  margin-top: 20px;
  text-align: left;
  display: inline-block;
}

/* 汇率输入 */
.rate-box {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

/* 结算模式玩家卡片 */
.player-card-settle {
  width: 220px;
  text-align: center;
}

/* 总体玩家输入布局 */
.input-box {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}
</style>