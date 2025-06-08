<template>
	<div class="staff-container" :key="renderKey">
		<div v-if="note" class="staff-display" ref="staffElement">
			<!-- ABC.js 渲染的五线谱会插入到这里 -->
		</div>
		<div v-else class="empty-staff">
			♪ 准备中...
		</div>
	</div>
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
		
		data() {
			return {
				abcjsLoaded: false,
				renderKey: 0
			}
		},
		
		watch: {
			note: {
				handler(newNote) {
					if (newNote) {
						this.$nextTick(() => {
							this.renderStaff(newNote.abc)
						})
					}
				},
				immediate: true
			}
		},
		
		mounted() {
			// 加载ABC.js库
			this.loadABCJS()
		},
		
		methods: {
			// 加载ABC.js库
			loadABCJS() {
				if (window.ABCJS) {
					this.abcjsLoaded = true
					if (this.note) {
						this.renderStaff(this.note.abc)
					}
					return
				}
				
				const script = document.createElement('script')
				script.src = 'https://cdn.jsdelivr.net/npm/abcjs@6.4.3/dist/abcjs-basic-min.js'
				script.onload = () => {
					console.log('ABC.js loaded')
					this.abcjsLoaded = true
					if (this.note) {
						this.renderStaff(this.note.abc)
					}
				}
				script.onerror = () => {
					console.warn('Failed to load ABC.js, using simple staff')
					this.abcjsLoaded = false
					this.renderSimpleStaff()
				}
				document.head.appendChild(script)
			},
			
			// 渲染五线谱
			renderStaff(abcNotation) {
				if (!this.$refs.staffElement) return
				
				// 清空之前的内容
				this.$refs.staffElement.innerHTML = ''
				
				// 强制重新渲染
				this.renderKey++
				
				try {
					// 如果有ABC.js库，使用它渲染
					if (window.ABCJS && this.abcjsLoaded) {
						window.ABCJS.renderAbc(this.$refs.staffElement, abcNotation, {
							scale: 2.0,
							staffwidth: 30,
							wrap: {
								minSpacing: 2.0,
								maxSpacing: 3.0,
								preferredMeasuresPerLine: 1
							}
						})
					} else {
						// 简化版本：显示音符名称
						this.renderSimpleStaff()
					}
				} catch (error) {
					console.error('Error rendering staff:', error)
					this.renderSimpleStaff()
				}
			},
			
			// 简化版五线谱渲染
			renderSimpleStaff() {
				if (!this.$refs.staffElement || !this.note) return
				
				const noteMap = {
					'C': { position: 'very-low', name: 'C4' },
					'D': { position: 'low', name: 'D4' },
					'E': { position: 'medium-low', name: 'E4' },
					'F': { position: 'medium', name: 'F4' },
					'G': { position: 'medium-high', name: 'G4' },
					'A': { position: 'high', name: 'A4' },
					'B': { position: 'very-high', name: 'B4' },
					'c': { position: 'top', name: 'C5' }
				}
				
				const noteName = this.note.abc.slice(-1)
				const noteInfo = noteMap[noteName] || { position: 'medium', name: noteName }
				
				this.$refs.staffElement.innerHTML = `
					<div class="simple-staff">
						<div class="clef">𝄞</div>
						<div class="staff-lines">
							<div class="line"></div>
							<div class="line"></div>
							<div class="line"></div>
							<div class="line"></div>
							<div class="line"></div>
						</div>
						<div class="note ${noteInfo.position}">
							<div class="note-head">●</div>
							<div class="note-name">${noteInfo.name}</div>
						</div>
					</div>
				`
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
	
	.staff-display svg {
		margin: 0 auto;
		display: block;
		max-width: 300px !important;
		width: 300px !important;
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
		width: 80px;
		height: 80px;
	}
	
	.staff-lines .line {
		width: 100%;
		height: 2px;
		background: #333;
		margin: 18px 0;
		position: relative;
	}
	
	.note {
		position: absolute;
		left: 90px;
		font-size: 32px;
		font-weight: bold;
		color: #333;
		text-align: center;
		width: 40px;
	}
	
	.note.top {
		top: 10px;
	}
	
	.note.very-high {
		top: 20px;
	}
	
	.note.high {
		top: 35px;
	}
	
	.note.medium-high {
		top: 50px;
	}
	
	.note.medium {
		top: 65px;
	}
	
	.note.medium-low {
		top: 80px;
	}
	
	.note.low {
		top: 95px;
	}
	
	.note.very-low {
		top: 110px;
	}
	
	.note-head {
		font-size: 32px;
		line-height: 1;
	}
	
	.note-name {
		font-size: 12px;
		margin-top: 4px;
		font-weight: 600;
		color: #666;
	}
</style> 