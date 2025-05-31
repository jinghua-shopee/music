// 数据库配置和操作工具
const DB_CONFIG = {
  url: 'libsql://musical-cherly-jinghuayang-c0cb9d18.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3MzU1NjQyMjMsImlkIjoiMGFiN2E3NzYtZTU1MS00MWZjLWJiZWQtNmZmNDc1ODI3NDUyIn0.iq69kkXGUc7L8vhZ4xWfm2-ymnxMZQJWe_qQLpJdGCqLLKMK9dU6U9l8THHTGqVDgzRfAqbRLKaJGt77_fKxBw'
}

let dbClient = null
let currentUserId = null
let currentSessionId = null

// 初始化数据库
async function initDatabase() {
  try {
    // #ifdef H5
    const { createClient } = await import('@libsql/client/web')
    dbClient = createClient({
      url: DB_CONFIG.url,
      authToken: DB_CONFIG.authToken
    })
    // #endif
    
    // #ifdef MP-WEIXIN
    // 小程序环境可能需要使用不同的客户端或通过云函数
    console.log('小程序环境暂不支持直接数据库连接')
    // #endif
    
    console.log('数据库初始化成功')
    return true
  } catch (error) {
    console.error('数据库初始化失败:', error)
    return false
  }
}

// 生成用户唯一标识
function generateUserIdentifier() {
  try {
    let userId = uni.getStorageSync('music_user_id')
    if (userId) return userId
    
    // 生成设备指纹
    const systemInfo = uni.getSystemInfoSync()
    const fingerprint = [
      systemInfo.platform,
      systemInfo.system,
      systemInfo.model,
      systemInfo.pixelRatio,
      systemInfo.screenWidth,
      systemInfo.screenHeight,
      Date.now().toString(),
      Math.random().toString()
    ].join('|')
    
    // 简单哈希
    let hash = 0
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    
    userId = 'user_' + Math.abs(hash).toString(36) + Date.now().toString(36)
    uni.setStorageSync('music_user_id', userId)
    return userId
  } catch (error) {
    console.error('生成用户标识失败:', error)
    return 'user_' + Date.now().toString(36)
  }
}

// 获取或创建用户
async function getOrCreateUser() {
  if (!dbClient) return null
  
  try {
    const userIdentifier = generateUserIdentifier()
    
    // 查询用户是否存在
    const result = await dbClient.execute({
      sql: 'SELECT id FROM users WHERE identifier = ?',
      args: [userIdentifier]
    })
    
    if (result.rows.length > 0) {
      currentUserId = result.rows[0].id
      return currentUserId
    }
    
    // 创建新用户
    const insertResult = await dbClient.execute({
      sql: `INSERT INTO users (identifier, created_at) VALUES (?, datetime('now')) RETURNING id`,
      args: [userIdentifier]
    })
    
    if (insertResult.rows.length > 0) {
      currentUserId = insertResult.rows[0].id
      console.log('创建新用户:', currentUserId)
      return currentUserId
    }
    
    return null
  } catch (error) {
    console.error('获取或创建用户失败:', error)
    return null
  }
}

// 创建学习会话
async function createLearningSession(mode, questionCount) {
  if (!dbClient || !currentUserId) return null
  
  try {
    const result = await dbClient.execute({
      sql: `INSERT INTO learning_sessions 
            (user_id, mode, question_count, start_time, created_at) 
            VALUES (?, ?, ?, datetime('now'), datetime('now')) 
            RETURNING id`,
      args: [currentUserId, mode, questionCount]
    })
    
    if (result.rows.length > 0) {
      currentSessionId = result.rows[0].id
      console.log('创建学习会话:', currentSessionId)
      return currentSessionId
    }
    
    return null
  } catch (error) {
    console.error('创建学习会话失败:', error)
    return null
  }
}

// 记录题目答题
async function recordQuestion(questionData) {
  if (!dbClient || !currentSessionId) return false
  
  try {
    await dbClient.execute({
      sql: `INSERT INTO question_records 
            (session_id, note_name, note_octave, user_answer, is_correct, 
             reaction_time, pause_duration, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      args: [
        currentSessionId,
        questionData.noteName,
        questionData.noteOctave,
        questionData.userAnswer,
        questionData.isCorrect ? 1 : 0,
        questionData.reactionTime,
        questionData.pauseDuration
      ]
    })
    
    // 更新音符统计
    await updateNoteStatistics(questionData)
    return true
  } catch (error) {
    console.error('记录题目失败:', error)
    return false
  }
}

// 更新音符统计
async function updateNoteStatistics(questionData) {
  if (!dbClient || !currentUserId) return false
  
  try {
    // 查询现有统计
    const result = await dbClient.execute({
      sql: `SELECT total_attempts, correct_attempts, avg_reaction_time 
            FROM note_statistics 
            WHERE user_id = ? AND note_name = ? AND note_octave = ?`,
      args: [currentUserId, questionData.noteName, questionData.noteOctave]
    })
    
    if (result.rows.length > 0) {
      // 更新现有统计
      const stats = result.rows[0]
      const newTotal = stats.total_attempts + 1
      const newCorrect = stats.correct_attempts + (questionData.isCorrect ? 1 : 0)
      const newSuccessRate = (newCorrect / newTotal) * 100
      const newAvgReaction = questionData.reactionTime ?
        (stats.avg_reaction_time * stats.total_attempts + questionData.reactionTime) / newTotal :
        stats.avg_reaction_time
      
      await dbClient.execute({
        sql: `UPDATE note_statistics 
              SET total_attempts = ?, correct_attempts = ?, 
                  success_rate = ?, avg_reaction_time = ?, updated_at = datetime('now')
              WHERE user_id = ? AND note_name = ? AND note_octave = ?`,
        args: [newTotal, newCorrect, newSuccessRate, newAvgReaction, 
               currentUserId, questionData.noteName, questionData.noteOctave]
      })
    } else {
      // 创建新统计
      const successRate = questionData.isCorrect ? 100 : 0
      await dbClient.execute({
        sql: `INSERT INTO note_statistics 
              (user_id, note_name, note_octave, total_attempts, correct_attempts, 
               success_rate, avg_reaction_time, created_at, updated_at) 
              VALUES (?, ?, ?, 1, ?, ?, ?, datetime('now'), datetime('now'))`,
        args: [currentUserId, questionData.noteName, questionData.noteOctave,
               questionData.isCorrect ? 1 : 0, successRate, 
               questionData.reactionTime || 0]
      })
    }
    
    return true
  } catch (error) {
    console.error('更新音符统计失败:', error)
    return false
  }
}

// 完成学习会话
async function completeLearningSession(sessionData) {
  if (!dbClient || !currentSessionId) return false
  
  try {
    await dbClient.execute({
      sql: `UPDATE learning_sessions 
            SET end_time = datetime('now'), total_questions = ?, correct_answers = ?, 
                accuracy_rate = ?, avg_reaction_time = ?, is_completed = ?
            WHERE id = ?`,
      args: [
        sessionData.totalQuestions,
        sessionData.correctAnswers,
        sessionData.accuracyRate,
        sessionData.avgReactionTime,
        sessionData.isCompleted ? 1 : 0,
        currentSessionId
      ]
    })
    
    console.log('学习会话完成')
    currentSessionId = null
    return true
  } catch (error) {
    console.error('完成学习会话失败:', error)
    return false
  }
}

// 记录PK对战
async function recordPKBattle(battleData) {
  if (!dbClient || !currentUserId) return false
  
  try {
    // 计算胜者
    let winner = 0 // 平局
    const p1Score = battleData.player1Stats.correct / Math.max(battleData.player1Stats.total, 1)
    const p2Score = battleData.player2Stats.correct / Math.max(battleData.player2Stats.total, 1)
    
    if (p1Score > p2Score) winner = 1
    else if (p2Score > p1Score) winner = 2
    
    await dbClient.execute({
      sql: `INSERT INTO pk_battles 
            (user_id, p1_total, p1_correct, p1_accuracy, p1_avg_reaction,
             p2_total, p2_correct, p2_accuracy, p2_avg_reaction, winner, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      args: [
        currentUserId,
        battleData.player1Stats.total,
        battleData.player1Stats.correct,
        (battleData.player1Stats.correct / Math.max(battleData.player1Stats.total, 1)) * 100,
        battleData.player1Stats.avgReaction || 0,
        battleData.player2Stats.total,
        battleData.player2Stats.correct,
        (battleData.player2Stats.correct / Math.max(battleData.player2Stats.total, 1)) * 100,
        battleData.player2Stats.avgReaction || 0,
        winner
      ]
    })
    
    return true
  } catch (error) {
    console.error('记录PK对战失败:', error)
    return false
  }
}

export {
  initDatabase,
  generateUserIdentifier,
  getOrCreateUser,
  createLearningSession,
  recordQuestion,
  updateNoteStatistics,
  completeLearningSession,
  recordPKBattle,
  currentUserId,
  currentSessionId
} 