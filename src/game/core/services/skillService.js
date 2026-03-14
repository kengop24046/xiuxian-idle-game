import { gameState } from '../gameState.js'
import { SKILL_CONFIG } from '../../config.js'
import { saveGame } from './saveService.js'

export const castActiveSkill = (sid) => {
  const skill = SKILL_CONFIG.active.find(s => s.id === sid)
  if (!skill || gameState.skills.cd[sid] > Date.now()) {
    return { success: false, msg: '技能冷却中或不存在' }
  }
  gameState.skills.cd[sid] = Date.now() + skill.cd
  gameState.skills.equippedActive = sid
  if (skill.effect === 'shield') {
    gameState.shield = 1
  }
  saveGame()
  return { success: true, skill, msg: `释放${skill.name}成功！` }
}

export const autoCastActiveSkill = () => {
  const equippedActiveSid = gameState.skills.equippedActive
  if (!equippedActiveSid) {
    return { success: false, msg: '未装备主动神通', type: 'no_skill' }
  }

  const isOnCooldown = gameState.skills.cd[equippedActiveSid] > Date.now()
  if (isOnCooldown) {
    const remainingCd = Math.ceil((gameState.skills.cd[equippedActiveSid] - Date.now()) / 1000)
    return { 
      success: false, 
      msg: `主动神通冷却中，剩余${remainingCd}秒`, 
      type: 'cooldown',
      remainingCd 
    }
  }

  const castResult = castActiveSkill(equippedActiveSid)
  return {
    ...castResult,
    type: 'cast_success'
  }
}