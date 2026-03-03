<template>
  <div class="container">
    <el-card shadow="hover" class="card">
      <h2>100以内四则运算训练</h2>

      <!-- 模式选择 -->
      <el-radio-group v-model="mode" :disabled="isRunning">
        <el-radio-button label="addSub">加减法</el-radio-button>
        <el-radio-button label="mulDiv">乘除法</el-radio-button>
      </el-radio-group>

      <!-- 开始按钮 + 倒计时 -->
      <div style="margin: 20px 0;">
        <el-button type="primary" @click="startGame" v-if="!isRunning">
          开始训练
        </el-button>

        <el-tag type="warning" v-if="isRunning">
          剩余时间：{{ timeLeft }} 秒
        </el-tag>
      </div>

      <!-- 题目 -->
      <div class="question" v-if="isRunning">
        <span>{{ num1 }}</span>
        <span>{{ operator }}</span>
        <span>{{ num2 }}</span>
        <span>=</span>
      </div>

      <!-- 输入框 -->
      <el-input
        v-model="userAnswer"
        placeholder="请输入答案"
        @keyup.enter="checkAnswer"
        :disabled="!isRunning"
        clearable
      />

      <!-- 统计 -->
      <div class="result">
        <el-tag type="success">正确：{{ correctCount }}</el-tag>
        <el-tag type="danger">错误：{{ wrongCount }}</el-tag>
      </div>

      <!-- 错题记录 -->
      <div v-if="wrongList.length" class="wrong-box">
        <h3>错题记录：</h3>
        <el-table :data="wrongList" border style="width: 100%">
          <el-table-column prop="question" label="题目" />
          <el-table-column prop="correct" label="正确答案" />
          <el-table-column prop="user" label="你的答案" />
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from "vue"

const num1 = ref(0)
const num2 = ref(0)
const operator = ref("+")
const correctAnswer = ref(0)

const userAnswer = ref("")
const correctCount = ref(0)
const wrongCount = ref(0)
const wrongList = ref([])

const mode = ref("addSub")

const isRunning = ref(false)
const timeLeft = ref(60)
let timer = null

// 开始训练
const startGame = () => {
  correctCount.value = 0
  wrongCount.value = 0
  wrongList.value = []
  timeLeft.value = 60
  isRunning.value = true

  generateQuestion()

  timer = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      stopGame()
    }
  }, 1000)
}

// 停止训练
const stopGame = () => {
  clearInterval(timer)
  isRunning.value = false
}

// 生成题目
const generateQuestion = () => {
  if (mode.value === "addSub") {
    operator.value = Math.random() > 0.5 ? "+" : "-"
    num1.value = Math.floor(Math.random() * 100)
    num2.value = Math.floor(Math.random() * 100)

    if (operator.value === "-" && num1.value < num2.value) {
      ;[num1.value, num2.value] = [num2.value, num1.value]
    }
  } else {
    operator.value = Math.random() > 0.5 ? "×" : "÷"

    if (operator.value === "×") {
      num1.value = Math.floor(Math.random() * 100)
      num2.value = Math.floor(Math.random() * 100)
    } else {
      num2.value = Math.floor(Math.random() * 9) + 1
      correctAnswer.value = Math.floor(Math.random() * 10)
      num1.value = num2.value * correctAnswer.value
    }
  }

  calculateAnswer()
  userAnswer.value = ""
}

// 计算答案
const calculateAnswer = () => {
  switch (operator.value) {
    case "+":
      correctAnswer.value = num1.value + num2.value
      break
    case "-":
      correctAnswer.value = num1.value - num2.value
      break
    case "×":
      correctAnswer.value = num1.value * num2.value
      break
    case "÷":
      correctAnswer.value = num1.value / num2.value
      break
  }
}

// 校验答案
const checkAnswer = () => {
  if (!isRunning.value) return

  if (Number(userAnswer.value) === correctAnswer.value) {
    correctCount.value++
  } else {
    wrongCount.value++
    wrongList.value.push({
      question: `${num1.value} ${operator.value} ${num2.value}`,
      correct: correctAnswer.value,
      user: userAnswer.value
    })
  }

  generateQuestion()
}

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  margin-top: 60px;
}

.card {
  width: 500px;
  text-align: center;
}

.question {
  font-size: 36px;
  margin: 30px 0;
  font-weight: bold;
}

.result {
  margin-top: 20px;
  display: flex;
  justify-content: space-around;
}

.wrong-box {
  margin-top: 30px;
}
</style>