<template>
  <div class="container">
    <el-card class="card">
      <h2>🧠 数字记忆训练</h2>

      <div v-if="!isRunning && !showNumbers">
        <el-button type="primary" @click="startGame">开始训练</el-button>
      </div>

      <div v-else>
        <!-- 显示数字阶段 -->
        <div v-if="showNumbers" class="numbers-display">
          <p>{{ numbers.join(' ') }}</p>
          <small>记住这些数字，5秒后输入</small>
        </div>

        <!-- 输入阶段 -->
        <div v-else class="input-section">
          <div class="inputs">
            <el-input
              v-for="(n, idx) in numbers"
              :key="idx"
              v-model.number="userInput[idx]"
              :ref="el => inputRefs[idx] = el"
              @keyup.enter="checkInput"
              placeholder="?"
              maxlength="2"
            />
          </div>
          <el-button type="success" @click="checkInput" style="margin-top:10px;">
            校验
          </el-button>
        </div>

        <!-- 提示结果 -->
        <div v-if="result" class="result-box" v-html="result"></div>

        <!-- 下一轮按钮 -->
        <div v-if="result">
          <el-button type="primary" @click="startGame" style="margin-top: 10px;">
            下一轮
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'

const numbers = ref([])
const userInput = reactive([])
const showNumbers = ref(false)
const isRunning = ref(false)
const result = ref('')
const inputRefs = []

// 生成随机5~8个数字
function getRandomNumbers() {
  const len = Math.floor(Math.random() * 4) + 5
  const nums = []
  for (let i = 0; i < len; i++) {
    nums.push(Math.floor(Math.random() * 99) + 1)
  }
  return nums
}

// 开始训练
function startGame() {
  numbers.value = getRandomNumbers()
  userInput.length = 0
  for (let i = 0; i < numbers.value.length; i++) userInput.push(null)
  showNumbers.value = true
  isRunning.value = true
  result.value = ''

  setTimeout(() => {
    showNumbers.value = false
    nextTick(() => {
      inputRefs[0]?.focus?.()
    })
  }, 5000)
}

// 校验输入
function checkInput() {
  const wrongIndices = []

  for (let i = 0; i < numbers.value.length; i++) {
    const user = userInput[i] != null ? userInput[i] : '?'
    if (user !== numbers.value[i]) {
      wrongIndices.push(i)
    }
  }

  if (wrongIndices.length === 0) {
    result.value = `✅ 全部正确！数字：<strong>${numbers.value.join(' ')}</strong>`
  } else {
    const userNums = userInput.map((n, idx) => (n != null ? n : '?'))
    result.value = `
      ❌ 出错啦！<br>
      <strong>题目：</strong>${numbers.value.join(' ')}<br>
      <strong>正确结果：</strong>${numbers.value.join(' ')}<br>
      <strong>你的输入：</strong>${userNums.join(' ')}
    `
  }

  // 不重置题目，让用户看到结果
  // isRunning.value = false
}
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  margin-top: 50px;
}
.card {
  width: 700px;
  text-align: center;
}
.numbers-display {
  font-size: 2rem;
  margin: 20px 0;
}
.input-section {
  margin: 20px 0;
}
.inputs {
  display: flex;
  gap: 10px;
  justify-content: center;
}
.inputs .el-input {
  width: 60px;
  text-align: center;
}
.result-box {
  margin-top: 20px;
  font-size: 1.2rem;
  color: #333;
}
</style>