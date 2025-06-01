<template>
	<view class="staff-container">
		<view v-if="note" class="staff-display">
			<!-- 使用简化版五线谱显示 -->
			<view class="simple-staff">
				<view class="clef">𝄞</view>
				<view class="staff-lines">
					<view class="line"></view>
					<view class="line"></view>
					<view class="line"></view>
					<view class="line"></view>
					<view class="line"></view>
				</view>
				<view class="note" :class="notePosition">
					<view class="note-head">●</view>
					<view class="note-name">{{ noteName }}</view>
				</view>
			</view>
		</view>
		<view v-else class="empty-staff">
			<text>♪ 准备中...</text>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'Staff',
		
		props: {
			note: {
				type: Object,
				default: null
			}
		},
		
		computed: {
			notePosition() {
				if (!this.note) return 'medium'
				
				const noteMap = {
					'C': 'very-low',
					'D': 'low', 
					'E': 'medium-low',
					'F': 'medium',
					'G': 'medium-high',
					'A': 'high',
					'B': 'very-high',
					'c': 'top'
				}
				
				const noteName = this.note.abc ? this.note.abc.slice(-1) : 'C'
				return noteMap[noteName] || 'medium'
			},
			
			noteName() {
				if (!this.note) return ''
				
				const noteMap = {
					'C': 'C4',
					'D': 'D4',
					'E': 'E4', 
					'F': 'F4',
					'G': 'G4',
					'A': 'A4',
					'B': 'B4',
					'c': 'C5'
				}
				
				const noteName = this.note.abc ? this.note.abc.slice(-1) : 'C'
				return noteMap[noteName] || noteName
			}
		}
	}
</script>

<style scoped>
	.staff-container {
		width: 100%;
		height: 180px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.staff-display {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
	}
	
	.empty-staff {
		font-size: 24px;
		color: #999;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
	}
	
	/* 简化版五线谱样式 */
	.simple-staff {
		position: relative;
		width: 280px;
		height: 140px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.clef {
		position: absolute;
		left: 10px;
		top: 25px;
		font-size: 48px;
		color: #333;
		font-family: serif;
	}
	
	.staff-lines {
		position: absolute;
		top: 30px;
		left: 50px;
		width: 180px;
		height: 80px;
	}
	
	.line {
		position: absolute;
		width: 100%;
		height: 2px;
		background: #333;
		left: 0;
	}
	
	.line:nth-child(1) { top: 0px; }
	.line:nth-child(2) { top: 16px; }
	.line:nth-child(3) { top: 32px; }
	.line:nth-child(4) { top: 48px; }
	.line:nth-child(5) { top: 64px; }
	
	.note {
		position: absolute;
		left: 150px;
		display: flex;
		flex-direction: column;
		align-items: center;
		z-index: 10;
	}
	
	.note-head {
		font-size: 32px;
		color: #333;
		font-weight: bold;
		line-height: 1;
	}
	
	.note-name {
		font-size: 12px;
		color: #666;
		margin-top: 4px;
		font-weight: bold;
	}
	
	/* 音符位置 */
	.note.very-low { top: 95px; }
	.note.low { top: 87px; }
	.note.medium-low { top: 79px; }
	.note.medium { top: 71px; }
	.note.medium-high { top: 63px; }
	.note.high { top: 55px; }
	.note.very-high { top: 47px; }
	.note.top { top: 39px; }
	
	/* 响应式设计 */
	@media (max-width: 480px) {
		.simple-staff {
			width: 200px;
			height: 100px;
		}
		
		.clef {
			font-size: 32px;
			left: 5px;
			top: 15px;
		}
		
		.staff-lines {
			left: 30px;
			width: 120px;
			height: 60px;
		}
		
		.line:nth-child(1) { top: 0px; }
		.line:nth-child(2) { top: 12px; }
		.line:nth-child(3) { top: 24px; }
		.line:nth-child(4) { top: 36px; }
		.line:nth-child(5) { top: 48px; }
		
		.note {
			left: 100px;
		}
		
		.note-head {
			font-size: 24px;
		}
		
		.note.very-low { top: 67px; }
		.note.low { top: 61px; }
		.note.medium-low { top: 55px; }
		.note.medium { top: 49px; }
		.note.medium-high { top: 43px; }
		.note.high { top: 37px; }
		.note.very-high { top: 31px; }
		.note.top { top: 25px; }
	}
</style> 