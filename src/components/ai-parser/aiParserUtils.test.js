import { describe, expect, it } from 'vitest'
import { shouldShowThinkingPanel, splitReplyAndThink } from './aiParserUtils.js'

describe('aiParserUtils', () => {
	it('当只有 progressMessage 时仍然显示过程面板', () => {
		expect(
			shouldShowThinkingPanel({
				progressMessage: '正在处理...',
				thinkingText: '',
			})
		).toBe(true)
	})

	it('没有 progressMessage 和 thinkingText 时不显示过程面板', () => {
		expect(
			shouldShowThinkingPanel({
				progressMessage: '',
				thinkingText: '',
			})
		).toBe(false)
	})

	it('能从 reply 中拆出 think 块并保留最终回答', () => {
		expect(splitReplyAndThink('<think>分析中</think>最终回答')).toEqual({
			replyText: '最终回答',
			thinkText: '分析中',
		})
	})
})
