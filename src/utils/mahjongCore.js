// mahjongCore.js

/***********************
 * 广东红中麻将核心引擎
 ***********************/

export function countTiles(tiles) {
  const counts = Array(28).fill(0)
  tiles.forEach(t => counts[t]++)
  return counts
}

function clone(arr) {
  return JSON.parse(JSON.stringify(arr))
}

/********* 胡牌判断 *********/
export function canHu(tiles) {
  if (tiles.length % 3 !== 2) return false
  const counts = countTiles(tiles)
  let laizi = counts[27]
  counts[27] = 0
  if (canSevenPairs(counts, laizi)) return true
  for (let i = 0; i < 27; i++) {
    if (counts[i] >= 2) {
      counts[i] -= 2
      if (canFormMelds(counts, laizi)) return true
      counts[i] += 2
    }
    if (counts[i] === 1 && laizi >= 1) {
      counts[i] -= 1
      if (canFormMelds(counts, laizi - 1)) return true
      counts[i] += 1
    }
  }
  if (laizi >= 2) {
    if (canFormMelds(counts, laizi - 2)) return true
  }
  return false
}

function canSevenPairs(counts, laizi) {
  let pairs = 0
  let singles = 0
  for (let i = 0; i < 27; i++) {
    pairs += Math.floor(counts[i] / 2)
    if (counts[i] % 2 === 1) singles++
  }
  return pairs + laizi >= 7 && singles <= laizi
}

function canFormMelds(counts, laizi) {
  let cloneCounts = clone(counts)
  for (let i = 0; i < 27; i++) {
    while (cloneCounts[i] > 0) {
      if (cloneCounts[i] >= 3) {
        cloneCounts[i] -= 3
        continue
      }
      if (cloneCounts[i] + laizi >= 3) {
        laizi -= (3 - cloneCounts[i])
        cloneCounts[i] = 0
        continue
      }
      if (i % 9 <= 6) {
        let need = 0
        for (let j = 0; j < 3; j++) {
          if (cloneCounts[i + j] === 0) need++
        }
        if (need <= laizi) {
          for (let j = 0; j < 3; j++) {
            if (cloneCounts[i + j] > 0) cloneCounts[i + j]--
            else laizi--
          }
          continue
        }
      }
      return false
    }
  }
  return true
}

/********* 听牌有效张 *********/
export function getEffectiveTiles(hand) {
  const result = []
  for (let i = 0; i < 27; i++) {
    if (hand.filter(t => t === i).length >= 4) continue
    const test = [...hand, i]
    if (canHu(test)) result.push(i)
  }
  return result
}

/********* 最优出牌分析 *********/
export function analyzeDiscards(hand) {
  const results = []
  for (let i = 0; i < hand.length; i++) {
    const newHand = [...hand]
    const discard = newHand.splice(i, 1)[0]
    const effective = getEffectiveTiles(newHand)
    const total = effective.reduce((sum, tile) => {
      const have = newHand.filter(t => t === tile).length
      return sum + (4 - have)
    }, 0)
    results.push({ discard, effectiveTiles: effective, effectiveCount: total })
  }
  results.sort((a, b) => b.effectiveCount - a.effectiveCount)
  return results
}

export function getBestDiscard(hand) {
  const analysis = analyzeDiscards(hand)
  return analysis[0]
}

/********* 随机手牌 *********/
export function generateRandomHand() {
  const pool = []
  for (let i = 0; i < 27; i++) for (let j = 0; j < 4; j++) pool.push(i)
  for (let j = 0; j < 4; j++) pool.push(27)
  pool.sort(() => Math.random() - 0.5)
  return pool.slice(0, 14).sort((a, b) => a - b)
}

/********* 牌名工具 *********/
export function tileName(t) {
    console.log(t)
  if (t == null) return "未知"
  if (t === 27) return "红中"
  if (t <= 8) return `${t + 1}万`
  if (t <= 17) return `${t - 8}筒`
  return `${t - 17}条`
}