<template>
	<div class="jianpu-container">
		<div v-if="note" class="jianpu-display">
			<div v-if="show" class="jianpu-note">
				<div class="octave-dots high" v-if="note.octave && note.octave > 4">
					<span v-for="n in (note.octave - 4)" :key="'high-' + n" class="dot">●</span>
				</div>
				<div class="jianpu-number">{{ note.jianpu }}</div>
				<div class="octave-dots low" v-if="note.octave && note.octave < 4">
					<span v-for="n in (4 - note.octave)" :key="'low-' + n" class="dot">●</span>
				</div>
			</div>
			<div v-else class="jianpu-placeholder">
				<div class="question-mark">?</div>
				<div class="hint">选择钢琴键后点击确认</div>
			</div>
		</div>
		<div v-else class="empty-jianpu">
			准备中...
		</div>
	</div>
</template>

<script>
	export default {
		name: 'Jianpu',
		
		props: {
			note: {
				type: Object,
				default: null
			},
			show: {
				type: Boolean,
				default: false
			}
		},
		
		computed: {
			octaveText() {
				if (!this.note || !this.note.octave) return ''
				
				if (this.note.octave === 4) {
					return '中音区'
				} else if (this.note.octave === 5) {
					return '高音区 (上方加点)'
				} else if (this.note.octave === 3) {
					return '低音区 (下方加点)'
				} else if (this.note.octave === 6) {
					return '倍高音区 (上方加两点)'
				} else if (this.note.octave === 2) {
					return '倍低音区 (下方加两点)'
				}
				return `第${this.note.octave}八度`
			}
		}
	}
</script>

<style scoped>
	.jianpu-container {
		width: 100%;
		height: 160px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.jianpu-display {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.jianpu-note {
		text-align: center;
		animation: fadeInScale 0.5s ease-out;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}
	
	.octave-dots {
		height: 20px;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 8px;
	}
	
	.octave-dots.high {
		order: -1;
	}
	
	.octave-dots.low {
		order: 1;
	}
	
	.dot {
		font-size: 16px;
		color: #1D3557;
		font-weight: bold;
	}
	
	.jianpu-number {
		font-size: 72px;
		font-weight: 900;
		color: #1D3557;
		line-height: 1;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
		order: 0;
	}
	
	.octave-indicator {
		font-size: 14px;
		color: #666;
		margin-top: 8px;
		font-weight: 600;
		order: 2;
	}
	
	.jianpu-placeholder {
		text-align: center;
		opacity: 0.6;
	}
	
	.question-mark {
		font-size: 72px;
		font-weight: 900;
		color: #999;
		line-height: 1;
	}
	
	.hint {
		font-size: 12px;
		color: #999;
		margin-top: 8px;
	}
	
	.empty-jianpu {
		font-size: 24px;
		color: #999;
		text-align: center;
	}
	
	@keyframes fadeInScale {
		0% {
			opacity: 0;
			transform: scale(0.8);
		}
		100% {
			opacity: 1;
			transform: scale(1);
		}
	}
	
	/* 响应式设计 */
	@media (max-width: 768px) {
		.jianpu-number,
		.question-mark {
			font-size: 56px;
		}
		
		.octave-indicator {
			font-size: 12px;
		}
		
		.hint {
			font-size: 10px;
		}
		
		.dot {
			font-size: 14px;
		}
	}
</style> 