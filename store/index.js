import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		// 游戏基本状态
		gameMode: '', // 'practice' | 'pk'
		maxQuestions: 15,
		currentQuestionIndex: 0,
		
		// 当前题目状态
		currentNote: null,
		selectedKey: null,
		hasShownJianpu: false,
		
		// 统计数据
		totalQuestions: 0,
		correctAnswers: 0,
		wrongAnswers: 0,
		averageReactionTime: 0,
		reactionTimes: [],
		
		// PK模式状态
		currentPlayer: 1, // 1 or 2
		pkPhase: 'player1', // 'player1' | 'player2' | 'completed'
		player1Stats: {
			correct: 0,
			wrong: 0,
			reactionTimes: []
		},
		player2Stats: {
			correct: 0,
			wrong: 0,
			reactionTimes: []
		},
		
		// 设置
		settings: {
			soundEnabled: true,
			vibrationEnabled: true,
			difficulty: 'normal' // easy, normal, hard
		}
	},
	
	getters: {
		// 正确率
		accuracyRate: (state) => {
			if (state.totalQuestions === 0) return 0
			return Math.round((state.correctAnswers / state.totalQuestions) * 100)
		},
		
		// 平均反应时间（秒）
		averageReactionTime: (state) => {
			if (state.reactionTimes.length === 0) return 0
			const sum = state.reactionTimes.reduce((a, b) => a + b, 0)
			return Math.round((sum / state.reactionTimes.length) / 1000 * 100) / 100 // 转换为秒，保留两位小数
		},
		
		// PK模式玩家统计
		player1AccuracyRate: (state) => {
			const total = state.player1Stats.correct + state.player1Stats.wrong
			if (total === 0) return 0
			return Math.round((state.player1Stats.correct / total) * 100)
		},
		
		player2AccuracyRate: (state) => {
			const total = state.player2Stats.correct + state.player2Stats.wrong
			if (total === 0) return 0
			return Math.round((state.player2Stats.correct / total) * 100)
		},
		
		// 平均反应时间（PK模式，秒）
		player1AverageReactionTime: (state) => {
			if (state.player1Stats.reactionTimes.length === 0) return 0
			const sum = state.player1Stats.reactionTimes.reduce((a, b) => a + b, 0)
			return Math.round((sum / state.player1Stats.reactionTimes.length) / 1000 * 100) / 100
		},
		
		player2AverageReactionTime: (state) => {
			if (state.player2Stats.reactionTimes.length === 0) return 0
			const sum = state.player2Stats.reactionTimes.reduce((a, b) => a + b, 0)
			return Math.round((sum / state.player2Stats.reactionTimes.length) / 1000 * 100) / 100
		},
		
		// 当前玩家统计
		currentPlayerStats: (state, getters) => {
			if (state.currentPlayer === 1) {
				return {
					correct: state.player1Stats.correct,
					wrong: state.player1Stats.wrong,
					accuracyRate: getters.player1AccuracyRate
				}
			} else {
				return {
					correct: state.player2Stats.correct,
					wrong: state.player2Stats.wrong,
					accuracyRate: getters.player2AccuracyRate
				}
			}
		},
		
		// 是否有完成的题目
		hasCompletedQuestions: (state) => {
			return state.totalQuestions > 0
		},
		
		// 当前玩家是否完成所有题目（PK模式）
		currentPlayerCompleted: (state) => {
			if (state.gameMode !== 'pk') return false
			const playerStats = state.currentPlayer === 1 ? state.player1Stats : state.player2Stats
			const playerTotal = playerStats.correct + playerStats.wrong
			return playerTotal >= state.maxQuestions
		},
		
		// PK模式是否完全结束
		pkGameCompleted: (state) => {
			if (state.gameMode !== 'pk') return false
			const player1Total = state.player1Stats.correct + state.player1Stats.wrong
			const player2Total = state.player2Stats.correct + state.player2Stats.wrong
			return player1Total >= state.maxQuestions && player2Total >= state.maxQuestions
		}
	},
	
	mutations: {
		// 游戏初始化
		START_GAME(state, payload) {
			state.gameMode = payload.mode
			state.maxQuestions = payload.maxQuestions
			state.currentQuestionIndex = 0
			state.totalQuestions = 0
			state.correctAnswers = 0
			state.wrongAnswers = 0
			state.reactionTimes = []
			
			// 重置PK模式数据
			if (payload.mode === 'pk') {
				state.currentPlayer = 1
				state.pkPhase = 'player1'
				state.player1Stats = { correct: 0, wrong: 0, reactionTimes: [] }
				state.player2Stats = { correct: 0, wrong: 0, reactionTimes: [] }
			}
		},
		
		// 设置当前音符
		SET_CURRENT_NOTE(state, note) {
			state.currentNote = note
		},
		
		// 设置选中的键
		SET_SELECTED_KEY(state, key) {
			state.selectedKey = key
		},
		
		// 设置是否已显示简谱
		SET_HAS_SHOWN_JIANPU(state, hasShown) {
			state.hasShownJianpu = hasShown
		},
		
		// 记录答案
		RECORD_ANSWER(state, payload) {
			const { isCorrect, reactionTime } = payload
			
			state.totalQuestions++
			state.hasShownJianpu = true
			
			if (isCorrect) {
				state.correctAnswers++
			} else {
				state.wrongAnswers++
			}
			
			if (reactionTime) {
				state.reactionTimes.push(reactionTime)
			}
			
			// PK模式记录当前玩家数据
			if (state.gameMode === 'pk') {
				const playerStats = state.currentPlayer === 1 ? state.player1Stats : state.player2Stats
				if (isCorrect) {
					playerStats.correct++
				} else {
					playerStats.wrong++
				}
				if (reactionTime) {
					playerStats.reactionTimes.push(reactionTime)
				}
			}
		},
		
		// 下一题
		NEXT_QUESTION(state) {
			state.currentQuestionIndex++
			state.selectedKey = null
			state.hasShownJianpu = false
		},
		
		// PK模式切换玩家
		SWITCH_PK_PLAYER(state) {
			if (state.gameMode === 'pk') {
				if (state.currentPlayer === 1) {
					state.currentPlayer = 2
					state.pkPhase = 'player2'
					state.currentQuestionIndex = 0 // 重置题目索引给第二个玩家
				} else {
					state.pkPhase = 'completed'
				}
			}
		},
		
		// 更新设置
		UPDATE_SETTINGS(state, settings) {
			state.settings = { ...state.settings, ...settings }
		}
	},
	
	actions: {
		// 开始游戏
		startGame({ commit }, gameData) {
			commit('START_GAME', gameData)
		},
		
		// 确认答案
		confirmAnswer({ commit, state }, payload) {
			commit('RECORD_ANSWER', payload)
		},
		
		// 下一题
		nextQuestion({ commit, state, getters }, payload = {}) {
			// 如果用户直接点击下一题而没有确认答案，记录为错误
			if (!state.hasShownJianpu) {
				commit('RECORD_ANSWER', { 
					isCorrect: false, 
					reactionTime: payload.reactionTime || null 
				})
			}
			
			// PK模式：检查当前玩家是否完成所有题目
			if (state.gameMode === 'pk' && getters.currentPlayerCompleted) {
				// 当前玩家完成，切换到下一个玩家或结束游戏
				commit('SWITCH_PK_PLAYER')
			} else {
				// 继续下一题
				commit('NEXT_QUESTION')
			}
		},
		
		// 强制切换PK玩家
		switchPKPlayer({ commit }) {
			commit('SWITCH_PK_PLAYER')
		},
		
		// 更新设置
		updateSettings({ commit }, settings) {
			commit('UPDATE_SETTINGS', settings)
		}
	}
}) 