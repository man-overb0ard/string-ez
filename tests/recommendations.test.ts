import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { factors, recommend, recommendationText, type Answers } from '../src/recommendations.ts'
import { stringCatalog, specifyString, findString, resolveStringMaterial } from '../src/stringCatalog.ts'
import { getPatterns } from '../src/rackets.ts'
const base: Answers = { level: 'Intermediário', racket: 'VCORE 98', pattern: '16 × 19', previous: 'Poliéster', tension: '50 lb', goal: 'Controle', pain: 'Não', layout: 'Full bed', liked: [] }

describe('configurações recomendadas', () => {
  it('gera três configurações únicas, com produtos e tensões inteiras, em todos os perfis válidos', () => {
    for (const level of ['Iniciante', 'Intermediário', 'Avançado'])
      for (const pain of ['Sim', 'Não'])
        for (const goal of ['Conforto', 'Controle', 'Potência', 'Efeito (spin)', 'Durabilidade'])
          for (const liked of [[], ...factors.map(f => [f])])
            for (const layout of ['Full bed', 'Híbrido']) {
              const result = recommend({ ...base, level, pain, goal, liked, layout, mains: 'Poliéster', crosses: 'Multifilamento', mainsTension: '60 lb', crossesTension: '30 lb' })
              assert.equal(result.length, 3)
              assert.equal(new Set(result.map(r => r.id)).size, 3)
              for (const r of result) {
                for (const spec of [r.mains, r.crosses]) {
                  assert.ok(spec.brand && spec.model && spec.gauge && spec.material)
                  if (pain === 'Sim' || level === 'Iniciante') assert.notEqual(spec.material, 'Poliéster')
                }
                for (const value of [r.tensions.mains, r.tensions.crosses]) {
                  assert.ok(Number.isInteger(value) && value >= 30 && value <= 69)
                }
                assert.ok(r.reason && r.tradeoff && r.preservation && r.tensions.explanation)
              }
            }
  })
  it('inclui uma alternativa híbrida para um full bed experiente que busca controle', () => {
    const results = recommend(base)
    const hybrid = results.find(r => r.layout === 'Híbrido')
    assert.ok(hybrid)
    assert.equal(hybrid.layoutChange, 'Muda de Full bed para Híbrido')
    assert.notEqual(hybrid.mains.model, hybrid.crosses.model)
  })
  it('os pontos a preservar alteram a escolha de configuração e o ajuste de tensão', () => {
    const plain = recommend(base)
    const comfort = recommend({ ...base, liked: ['Conforto'] })
    assert.notDeepEqual(plain.map(r => r.id), comfort.map(r => r.id))
    const shared = comfort.find(r => r.id === plain[0].id)
    assert.ok(shared)
    assert.ok(shared.tensions.mains < plain[0].tensions.mains)
    assert.match(shared.preservation, /Conforto/)
    assert.match(shared.preservation, /possível perda/)
  })
  it('considera separadamente as tensões de um híbrido e as inclui na cópia', () => {
    const results = recommend({ ...base, layout: 'Híbrido', mains: 'Poliéster', crosses: 'Multifilamento', mainsTension: '54 lb', crossesTension: '48 lb', liked: ['Conforto'] })
    const hybrid = results.find(r => r.layout === 'Híbrido')
    assert.ok(hybrid)
    assert.notEqual(hybrid.tensions.mains, hybrid.tensions.crosses)
    assert.match(hybrid.tensionComparison, /Mains: 54/)
    assert.match(hybrid.tensionComparison, /Crosses: 48/)
    const copied = recommendationText(hybrid)
    assert.match(copied, /Mains \(verticais\):/)
    assert.match(copied, /Crosses \(horizontais\):/)
    assert.ok(copied.includes(hybrid.mains.model) && copied.includes(hybrid.crosses.model))
    assert.match(copied, /faixa.*fabricante/)
  })
  it('usa o objetivo, o material atual e o padrão no ajuste de tensão', () => {
    const normal = recommend({ ...base, goal: 'Potência' })
    const dense = recommend({ ...base, goal: 'Potência', pattern: '18 × 20' })
    assert.equal(dense[0].id, normal[0].id)
    assert.equal(dense[0].tensions.mains, normal[0].tensions.mains - 1)
    const softCurrent = recommend({ ...base, previous: 'Multifilamento' })
    const samePoly = softCurrent.find(r => r.id === 'ptp')
    assert.ok(samePoly)
    assert.ok(samePoly.tensions.mains < recommend(base).find(r => r.id === 'ptp')!.tensions.mains)
  })
  it('não aumenta a tensão de um full bed que relata dor e exclui poliéster', () => {
    for (const r of recommend({ ...base, pain: 'Sim' })) {
      assert.ok(r.tensions.mains < 50)
      assert.notEqual(r.mains.material, 'Poliéster')
      assert.notEqual(r.crosses.material, 'Poliéster')
    }
  })
  it('limita sugestões às bordas do protótipo e explica quando o ajuste foi limitado', () => {
    for (const tension of ['30 lb', '69 lb']) {
      const r = recommend({ ...base, tension, goal: tension === '30 lb' ? 'Conforto' : 'Controle', previous: 'Multifilamento' })
      assert.ok(r.every(s => s.tensions.mains >= 30 && s.tensions.crosses <= 69))
      assert.ok(r.some(s => s.tensions.explanation.includes('limitado')))
    }
  })
  it('não inventa tensões para históricos ausentes, fora dos limites ou na unidade antiga', () => {
    for (const tension of ['', '23 kg', '29 lb', '70 lb', '50.5 lb', '50garbage lb']) assert.deepEqual(recommend({ ...base, tension }), [])
    assert.deepEqual(recommend({ ...base, layout: 'Híbrido', mainsTension: '50 lb' }), [])
  })
})

describe('padrões por modelo', () => {
  it('identifica modelos de padrão único e variantes de um mesmo modelo', () => {
    assert.deepEqual(getPatterns('Yonex', 'VCORE', '98'), ['16 × 19'])
    assert.deepEqual(getPatterns('Wilson', 'Blade', '98'), ['16 × 19', '18 × 20'])
    assert.deepEqual(getPatterns('Wilson', 'Blade', '100'), ['16 × 19'])
    assert.deepEqual(getPatterns('Babolat', 'Pure Strike', '98'), ['16 × 19', '18 × 20'])
    assert.deepEqual(getPatterns('Marca inexistente', 'Linha', 'Modelo'), [])
  })
})


describe('identificação da corda atual', () => {
  it('mantém o caminho por material e identifica materiais pelos modelos especificados', () => {
    assert.equal(resolveStringMaterial('Multifilamento', '', ''), 'Multifilamento')
    assert.equal(resolveStringMaterial(specifyString, 'Solinco', 'Hyper-G'), 'Poliéster')
    assert.equal(resolveStringMaterial(specifyString, 'HEAD', 'Velocity MLT'), 'Multifilamento')
    assert.equal(resolveStringMaterial(specifyString, 'Babolat', 'Touch VS'), 'Tripa natural')
    assert.equal(resolveStringMaterial(specifyString, 'Prince', 'Synthetic Gut with Duraflex'), 'Synthetic gut (nylon)')
    assert.equal(resolveStringMaterial(specifyString, 'Yonex', 'Hyper-G'), '')
  })
  it('inclui as marcas solicitadas com modelos únicos e materiais classificados', () => {
    for (const brand of ['Solinco','Yonex','Babolat','Tecnifibre','HEAD','Signum Pro','Robin Söderling (RS)']) assert.ok(stringCatalog[brand]?.length)
    for (const entries of Object.values(stringCatalog)) {
      assert.equal(new Set(entries.map(e => e.model)).size, entries.length)
      assert.ok(entries.every(e => ['Poliéster','Multifilamento','Synthetic gut (nylon)','Tripa natural'].includes(e.material)))
    }
  })
  it('resolve mains e crosses de marcas diferentes sem confundir o material usado no cálculo', () => {
    const detailed: Answers = { ...base, layout: 'Híbrido', mains: resolveStringMaterial(specifyString, 'Solinco', 'Hyper-G'), crosses: resolveStringMaterial(specifyString, 'HEAD', 'Velocity MLT'), mainsTension: '52 lb', crossesTension: '50 lb' }
    const generic = { ...detailed, mains: 'Poliéster', crosses: 'Multifilamento' }
    assert.deepEqual(recommend(detailed), recommend(generic))
    assert.equal(findString('Signum Pro', 'Tornado')?.material, 'Poliéster')
  })
})


describe('novas raquetes e faixa de tensão ampliada', () => {
  it('cadastra padrões únicos e variantes das três novas marcas', () => {
    assert.deepEqual(getPatterns('Tecnifibre', 'T-Fight', '305S'), ['18 × 19'])
    assert.deepEqual(getPatterns('Tecnifibre', 'TF40', '305'), ['16 × 19', '18 × 20'])
    assert.deepEqual(getPatterns('Dunlop', 'CX', '200 Tour'), ['16 × 19', '18 × 20'])
    assert.deepEqual(getPatterns('Dunlop', 'FX', '500'), ['16 × 19'])
    assert.deepEqual(getPatterns('Diadem', 'Elevate', '98'), ['16 × 20'])
    assert.deepEqual(getPatterns('Diadem', 'Nova', '100'), ['16 × 19'])
  })
  it('aceita cada tensão da nova linha de 60–69 e continua produzindo três opções', () => {
    for (let tension = 60; tension <= 69; tension++) {
      const result = recommend({ ...base, tension: `${tension} lb` })
      assert.equal(result.length, 3)
      assert.ok(result.every(r => r.tensions.mains <= 69 && r.tensions.crosses <= 69))
    }
    const hybrid = recommend({ ...base, layout: 'Híbrido', mains: 'Poliéster', crosses: 'Multifilamento', mainsTension: '69 lb', crossesTension: '65 lb' })
    assert.equal(hybrid.length, 3)
    assert.ok(hybrid.every(r => r.tensionComparison.includes('69')))
  })
})
