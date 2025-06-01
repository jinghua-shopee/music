<template>
	<div class="piano-container">
		<div class="piano-keyboard">
			<div class="white-keys">
				<div 
					v-for="key in whiteKeys" 
					:key="key.id"
					class="white-key"
					:class="{
						active: selectedKey === key.id,
						highlight: showAnswer && highlightKey === key.id,
						'default-highlight': key.id === 'C4' && selectedKey !== 'C4' && !showAnswer
					}"
					@click="selectKey(key.id)"
				>
					<div class="key-label">{{ key.label }}</div>
				</div>
			</div>
			<div class="black-keys">
				<div 
					v-for="key in blackKeys" 
					:key="key.id"
					class="black-key"
					:class="{
						active: selectedKey === key.id,
						highlight: showAnswer && highlightKey === key.id
					}"
					:style="{ left: key.position + '%' }"
					@click="selectKey(key.id)"
				>
					<div class="key-label">{{ key.label }}</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'Piano',
		
		props: {
			selectedKey: {
				type: String,
				default: null
			},
			highlightKey: {
				type: String,
				default: null
			},
			showAnswer: {
				type: Boolean,
				default: false
			}
		},
		
		data() {
			return {
				// 白键数据 - 扩展到3个八度
				whiteKeys: [
					// 第3八度
					{ id: 'C3', label: 'C3', note: 1 },
					{ id: 'D3', label: 'D3', note: 2 },
					{ id: 'E3', label: 'E3', note: 3 },
					{ id: 'F3', label: 'F3', note: 4 },
					{ id: 'G3', label: 'G3', note: 5 },
					{ id: 'A3', label: 'A3', note: 6 },
					{ id: 'B3', label: 'B3', note: 7 },
					// 第4八度 (中央八度)
					{ id: 'C4', label: 'C4', note: 1 },
					{ id: 'D4', label: 'D4', note: 2 },
					{ id: 'E4', label: 'E4', note: 3 },
					{ id: 'F4', label: 'F4', note: 4 },
					{ id: 'G4', label: 'G4', note: 5 },
					{ id: 'A4', label: 'A4', note: 6 },
					{ id: 'B4', label: 'B4', note: 7 },
					// 第5八度
					{ id: 'C5', label: 'C5', note: 1 },
					{ id: 'D5', label: 'D5', note: 2 },
					{ id: 'E5', label: 'E5', note: 3 },
					{ id: 'F5', label: 'F5', note: 4 },
					{ id: 'G5', label: 'G5', note: 5 },
					{ id: 'A5', label: 'A5', note: 6 },
					{ id: 'B5', label: 'B5', note: 7 }
				],
				
				// 黑键数据 - 扩展到3个八度
				blackKeys: [
					// 第3八度
					{ id: 'C#3', label: 'C#3', position: 3.57 },
					{ id: 'D#3', label: 'D#3', position: 7.14 },
					{ id: 'F#3', label: 'F#3', position: 14.29 },
					{ id: 'G#3', label: 'G#3', position: 17.86 },
					{ id: 'A#3', label: 'A#3', position: 21.43 },
					// 第4八度
					{ id: 'C#4', label: 'C#4', position: 28.57 },
					{ id: 'D#4', label: 'D#4', position: 32.14 },
					{ id: 'F#4', label: 'F#4', position: 39.29 },
					{ id: 'G#4', label: 'G#4', position: 42.86 },
					{ id: 'A#4', label: 'A#4', position: 46.43 },
					// 第5八度
					{ id: 'C#5', label: 'C#5', position: 53.57 },
					{ id: 'D#5', label: 'D#5', position: 57.14 },
					{ id: 'F#5', label: 'F#5', position: 64.29 },
					{ id: 'G#5', label: 'G#5', position: 67.86 },
					{ id: 'A#5', label: 'A#5', position: 71.43 }
				]
			}
		},
		
		methods: {
			selectKey(keyId) {
				console.log('Piano key selected:', keyId)
				this.$emit('key-select', keyId)
				
				// 播放音符声音 (如果支持)
				this.playNote(keyId)
			},
			
			// 播放音符声音
			playNote(keyId) {
				try {
					// 使用Web Audio API播放简单的音调
					if (window.AudioContext || window.webkitAudioContext) {
						const audioContext = new (window.AudioContext || window.webkitAudioContext)()
						const oscillator = audioContext.createOscillator()
						const gainNode = audioContext.createGain()
						
						// 根据音符计算频率
						const frequency = this.getFrequency(keyId)
						oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
						oscillator.type = 'sine'
						
						// 设置音量和时长
						gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
						gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
						
						oscillator.connect(gainNode)
						gainNode.connect(audioContext.destination)
						
						oscillator.start(audioContext.currentTime)
						oscillator.stop(audioContext.currentTime + 0.5)
					}
				} catch (error) {
					console.warn('Cannot play audio:', error)
				}
			},
			
			// 获取音符频率
			getFrequency(keyId) {
				// 基础频率映射 (C4 = 261.63 Hz)
				const frequencies = {
					'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
					'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
					'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77
				}
				return frequencies[keyId] || 440.00
			}
		}
	}
</script>

<style scoped>
	.piano-container {
		width: 100%;
		padding: 0;
		margin: 0;
		box-sizing: border-box;
		overflow-x: auto;
		height: 100%;
	}
	
	.piano-keyboard {
		position: relative;
		width: 100%;
		min-width: 100%;
		height: 100%;
		user-select: none;
		margin: 0;
	}
	
	.white-keys {
		display: flex;
		height: 100%;
		position: relative;
		z-index: 1;
	}
	
	.white-key {
		width: calc(100% / 21);
		background: linear-gradient(to bottom, #ffffff 0%, #f8f8f8 100%);
		border: 1px solid #ddd;
		border-radius: 0 0 8px 8px;
		cursor: pointer;
		transition: all 0.15s ease;
		position: relative;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		padding-bottom: 5px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}
	
	.white-key:hover {
		background: linear-gradient(to bottom, #f0f0f0 0%, #e8e8e8 100%);
		transform: translateY(1px);
	}
	
	.white-key.active {
		background: linear-gradient(to bottom, #007AFF 0%, #0056CC 100%);
		color: white;
		transform: translateY(2px);
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
	}
	
	.white-key.highlight {
		background: linear-gradient(to bottom, #34C759 0%, #28A745 100%);
		color: white;
		transform: translateY(1px);
		box-shadow: 0 4px 8px rgba(52, 199, 89, 0.4);
		animation: pulse 1s infinite;
	}
	
	.white-key.default-highlight {
		background: linear-gradient(to bottom, #F4D03F 0%, #E67E22 100%);
		color: white;
		transform: translateY(1px);
		box-shadow: 0 4px 8px rgba(244, 208, 63, 0.3);
	}
	
	.black-keys {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 65%;
		z-index: 2;
	}
	
	.black-key {
		position: absolute;
		width: 3%;
		height: 100%;
		background: linear-gradient(to bottom, #2c2c2c 0%, #1a1a1a 100%);
		border-radius: 0 0 4px 4px;
		cursor: pointer;
		transition: all 0.15s ease;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		padding-bottom: 4px;
		color: white;
		font-size: 12px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}
	
	.black-key:hover {
		background: linear-gradient(to bottom, #3c3c3c 0%, #2a2a2a 100%);
		transform: translateY(1px);
	}
	
	.black-key.active {
		background: linear-gradient(to bottom, #007AFF 0%, #0056CC 100%);
		transform: translateY(2px);
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}
	
	.black-key.highlight {
		background: linear-gradient(to bottom, #34C759 0%, #28A745 100%);
		transform: translateY(1px);
		box-shadow: 0 4px 8px rgba(52, 199, 89, 0.4);
		animation: pulse 1s infinite;
	}
	
	.key-label {
		font-size: 11px;
		font-weight: 600;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
		text-align: center;
		color: #333;
	}
	
	.white-key.active .key-label,
	.white-key.highlight .key-label {
		color: white;
	}
	
	.black-key .key-label {
		font-size: 9px;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
		color: white;
	}
	
	@keyframes pulse {
		0%, 100% {
			transform: translateY(1px) scale(1);
			box-shadow: 0 4px 8px rgba(52, 199, 89, 0.4);
		}
		50% {
			transform: translateY(1px) scale(1.02);
			box-shadow: 0 6px 12px rgba(52, 199, 89, 0.6);
		}
	}
	
	/* 响应式设计 */
	@media (max-width: 768px) {
		.piano-keyboard {
			min-width: 100%;
		}
		
		.key-label {
			font-size: 10px;
		}
		
		.black-key .key-label {
			font-size: 8px;
		}
		
		.black-key {
			width: 2.8%;
		}
	}
	
	@media (max-width: 480px) {
		.key-label {
			font-size: 9px;
		}
		
		.black-key .key-label {
			font-size: 7px;
		}
	}
</style> 