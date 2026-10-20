import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { recommend, type Answers } from '../src/recommendations.ts'
const base: Answers = {level:'Intermediário', racket:'Não sei', pattern:'16 × 19', previous:'Poliéster', tension:'50 lb', goal:'Controle', pain:'Não'}
describe('recomendações', () => {
  it('retorna três opções distintas para cada perfil e prioriza conforto para iniciantes ou desconforto', () => {
    for (const level of ['Iniciante','Intermediário','Avançado']) for (const pain of ['Sim','Não']) for (const goal of ['Conforto','Controle','Potência','Efeito (spin)','Durabilidade']) {
      const result = recommend({...base, level, pain, goal})
      assert.equal(result.length, 3)
      assert.equal(new Set(result.map(r => r.material)).size, 3)
      if (pain === 'Sim' || level === 'Iniciante') {
        assert.equal(result[0].material, 'Multifilamento')
        assert.ok(result.every(r => !r.material.toLowerCase().includes('poliéster')))
      }
    }
  })
  it('oferece copoliéster para controle e calibre maior para durabilidade em perfil experiente sem dor', () => {
    assert.equal(recommend(base)[0].material, 'Copoliéster')
    assert.equal(recommend({...base, goal:'Durabilidade'})[0].gauge, '1,30 mm')
  })
})
