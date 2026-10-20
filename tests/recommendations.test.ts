import { sortOptions } from '../src/sortOptions.ts'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { factors, recommend, recommendationText, type Answers } from '../src/recommendations.ts'
import { stringCatalog, specifyString, findString, resolveStringMaterial } from '../src/stringCatalog.ts'
import { improvementFactors, launchLow, launchHigh, nothingLiked, togglePreference, canSelectPreference } from '../src/preferences.ts'
import { rackets, getHeadSize, getPatterns } from '../src/rackets.ts'
const base: Answers = { level: 'Intermediário', racket: 'VCORE 98', pattern: '16 × 19', previous: 'Poliéster', tension: '50 lb', goals: ['Controle'], pain: 'Não', layout: 'Full bed', liked: [] }

describe('configurações recomendadas', () => {
  it('gera três configurações únicas, com produtos e tensões inteiras, em todos os perfis válidos', () => {
    for (const level of ['Iniciante', 'Intermediário', 'Avançado'])
      for (const pain of ['Sim', 'Não'])
        for (const goal of ['Conforto', 'Controle', 'Potência', 'Efeito (spin)', 'Durabilidade'])
          for (const liked of [[], ...factors.map(f => [f])])
            for (const layout of ['Full bed', 'Híbrido']) {
              const result = recommend({ ...base, level, pain, goals: [goal], liked, layout, mains: 'Poliéster', crosses: 'Multifilamento', mainsTension: '60 lb', crossesTension: '30 lb' })
              assert.equal(result.length, 3)
              assert.equal(new Set(result.map(r => r.id)).size, 3)
              for (const r of result) {
                for (const spec of [r.mains, r.crosses]) {
                  assert.ok(spec.brand && spec.model && spec.gauge && spec.material)
                  if (level === 'Iniciante') assert.notEqual(spec.material, 'Poliéster')
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
    const normal = recommend({ ...base, goals: ['Potência'] })
    const dense = recommend({ ...base, goals: ['Potência'], pattern: '18 × 20' })
    assert.equal(dense[0].id, normal[0].id)
    assert.equal(dense[0].tensions.mains, normal[0].tensions.mains - 1)
    const softCurrent = recommend({ ...base, previous: 'Multifilamento' })
    const samePoly = softCurrent.find(r => r.id === 'hyperg')
    assert.ok(samePoly)
    assert.ok(samePoly.tensions.mains < recommend(base).find(r => r.id === 'hyperg')!.tensions.mains)
  })
  it('não aumenta a tensão de um full bed que relata dor e reduz mais a tensão do poliéster', () => {
    for (const r of recommend({ ...base, pain: 'Sim' })) {
      assert.ok(r.tensions.mains < 50)
      if (r.mains.material === 'Poliéster') assert.ok(r.tensions.mains <= 45)
      if (r.crosses.material === 'Poliéster') assert.ok(r.tensions.crosses <= 45)
    }
  })
  it('limita sugestões às bordas do protótipo e explica quando o ajuste foi limitado', () => {
    for (const tension of ['30 lb', '69 lb']) {
      const r = recommend({ ...base, tension, goals: [tension === '30 lb' ? 'Conforto' : 'Controle'], previous: 'Multifilamento' })
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


describe('dois objetivos e ângulo de saída', () => {
  it('combina dois objetivos com o mesmo peso e sem depender da ordem de seleção', () => {
    const first = recommend({ ...base, goals: ['Controle', 'Potência'] })
    const second = recommend({ ...base, goals: ['Potência', 'Controle'] })
    assert.deepEqual(first.map(r => [r.id, r.tensions.mains, r.tensions.crosses]), second.map(r => [r.id, r.tensions.mains, r.tensions.crosses]))
    for (const r of first) {
      assert.match(r.reason, /controle e potência/)
      assert.match(r.tensions.explanation, /mesmo peso/)
      assert.match(recommendationText(r), /Controle e Potência/)
    }
    const sameMaterial = recommend({ ...base, previous: 'Tripa natural', goals: ['Controle', 'Potência'] }).find(r => r.id === 'gut')!
    assert.ok(sameMaterial)
    assert.equal(sameMaterial.tensions.mains, 50) // +controle e -potência se compensam no mesmo material.
  })
  it('cada combinação válida de objetivos produz três opções e respeita os filtros do perfil', () => {
    for (let i = 0; i < improvementFactors.length; i++) for (let j = i; j < improvementFactors.length; j++) {
      const goals = [...new Set([improvementFactors[i], improvementFactors[j]])]
      if (goals.includes(launchLow) && goals.includes(launchHigh)) continue
      for (const pain of ['Sim', 'Não']) {
        const results = recommend({ ...base, goals, pain, headSize: 98 })
        assert.equal(results.length, 3)
        for (const r of results) {
          assert.ok(Number.isInteger(r.tensions.mains) && r.tensions.mains >= 30 && r.tensions.mains <= 69)
          if (pain === 'Sim') {
            if (r.mains.material === 'Poliéster') assert.ok(r.tensions.mains <= 45)
            if (r.crosses.material === 'Poliéster') assert.ok(r.tensions.crosses <= 45)
            assert.ok(r.tensions.mains <= 48)
          }
        }
      }
    }
  })
  it('o ângulo desejado muda a tensão em sentidos diferentes para o mesmo produto', () => {
    const low = recommend({ ...base, headSize: 100, goals: [launchLow] })
    const high = recommend({ ...base, headSize: 100, goals: [launchHigh] })
    const shared = low.find(a => high.some(b => b.id === a.id))!
    assert.ok(shared)
    const counterpart = high.find(b => b.id === shared.id)!
    assert.ok(shared.tensions.mains > counterpart.tensions.mains)
    assert.match(shared.tensions.explanation, /hipótese/)
    assert.match(counterpart.tensions.explanation, /não pode ser previsto só pela tensão/)
  })
  it('usa geometria e padrão da raquete, sem inventar uma medição de ângulo', () => {
    assert.equal(getHeadSize('Yonex', 'VCORE', '98'), 98)
    assert.equal(getHeadSize('Yonex', 'EZONE', '100'), 100)
    assert.equal(getHeadSize('Tecnifibre', 'T-Fight', '305'), undefined)
    const small = recommend({ ...base, headSize: 98, goals: [launchLow] })
    const large = recommend({ ...base, headSize: 100, goals: [launchLow] })
    const shared = small.find(r => large.some(other => other.id === r.id))!
    assert.ok(shared)
    assert.equal(large.find(r => r.id === shared.id)!.tensions.mains, shared.tensions.mains + 1)
    const dense = recommend({ ...base, headSize: 98, pattern: '18 × 20', goals: [launchHigh] })
    const open = recommend({ ...base, headSize: 98, pattern: '16 × 19', goals: [launchHigh] })
    assert.equal(dense[0].id, open[0].id)
    assert.equal(dense[0].tensions.mains, open[0].tensions.mains - 1)
    assert.match(dense[0].tensions.explanation, /18 × 20.*98 pol²/)
    assert.match(dense[0].tensions.explanation, /não mede.*ângulo/)
    const unknown = recommend({ ...base, goals: [launchHigh] })
    assert.match(unknown[0].tensions.explanation, /tamanho da cabeça não validado/)
  })
  it('preservar o ângulo atual reduz o ajuste e explicita prioridades incompatíveis', () => {
    const plain = recommend({ ...base, goals: ['Controle'] })
    const preserved = recommend({ ...base, goals: ['Controle'], liked: [launchHigh] })
    const poly = preserved.find(r => r.id === 'hyperg')!
    assert.ok(poly)
    assert.ok(poly.tensions.mains < plain.find(r => r.id === 'hyperg')!.tensions.mains)
    assert.match(poly.preservation, /Ângulo de saída alto/)
    const conflict = recommend({ ...base, goals: [launchLow], liked: [launchHigh] })
    assert.match(conflict[0].tensions.explanation, /conflito/)
  })
  it('limita a dois objetivos e troca baixo por alto sem permitir contradição', () => {
    assert.deepEqual(togglePreference(['Controle'], launchLow, 2), ['Controle', launchLow])
    assert.deepEqual(togglePreference(['Controle', launchLow], launchHigh, 2), ['Controle', launchHigh])
    assert.deepEqual(togglePreference(['Controle', launchLow], 'Potência', 2), ['Controle', launchLow])
    assert.equal(canSelectPreference(['Controle', launchLow], launchHigh, 2), true)
    assert.equal(canSelectPreference(['Controle', launchLow], 'Potência', 2), false)
    assert.deepEqual(togglePreference([launchLow], launchHigh), [launchHigh])
    assert.deepEqual(togglePreference([launchLow], nothingLiked), [nothingLiked])
    assert.deepEqual(togglePreference([nothingLiked], launchHigh), [launchHigh])
    for (const goals of [[], ['Controle','Conforto','Potência'], [launchLow,launchHigh]]) assert.deepEqual(recommend({ ...base, goals }), [])
  })
})


describe('famílias Pro Kennex', () => {
  it('separa Ki e Q+ sem duplicar o prefixo no modelo ou perder padrões', () => {
    assert.deepEqual(rackets['Pro Kennex'].Ki.map(model => model.name), ['5', '10', '15'])
    assert.deepEqual(rackets['Pro Kennex']['Q+'].map(model => model.name), ['5', '15', 'Tour', 'Tour Pro', '5 Pro', '20', '30'])
    assert.deepEqual(getPatterns('Pro Kennex', 'Ki', '5'), ['16 × 20'])
    assert.deepEqual(getPatterns('Pro Kennex', 'Q+', '5'), ['16 × 20'])
    assert.deepEqual(getPatterns('Pro Kennex', 'Q+', 'Tour Pro'), ['18 × 20'])
  })
})

describe('poliéster com desconforto físico', () => {
  it('permite uma alternativa com poliéster em tensão reduzida e duas opções sem poliéster', () => {
    for (const goals of [['Controle'], ['Efeito (spin)'], ['Controle', 'Efeito (spin)']]) {
      const results = recommend({ ...base, pain: 'Sim', tension: '54 lb', goals })
      const polys = results.filter(r => r.mains.material === 'Poliéster' || r.crosses.material === 'Poliéster')
      assert.equal(polys.length, 1)
      assert.equal(results.length - polys.length, 2)
      const poly = polys[0]
      for (const [spec, tension] of [[poly.mains, poly.tensions.mains], [poly.crosses, poly.tensions.crosses]] as const) {
        if (spec.material === 'Poliéster') assert.ok(tension <= 45 && tension <= 54 - 4)
      }
      assert.match(poly.reason, /tensão reduzida/)
      assert.match(poly.tensions.explanation, /nem garante ausência de dor/)
      assert.match(recommendationText(poly), /não uma faixa clinicamente segura/)
      assert.match(poly.caution, /não torna o poliéster.*isenta de risco/)
    }
  })
  it('reduz a tensão do poliéster na direção correta de um híbrido', () => {
    const results = recommend({ ...base, pain: 'Sim', layout: 'Híbrido', mains: 'Tripa natural', crosses: 'Poliéster', mainsTension: '50 lb', crossesTension: '40 lb', liked: ['Potência'] })
    const hybrid = results.find(r => r.id === 'gut-poly')!
    assert.ok(hybrid)
    assert.equal(hybrid.tensions.mains, 48)
    assert.equal(hybrid.tensions.crosses, 36)
    assert.match(hybrid.tensionComparison, /Crosses: 40 → 36 lb/)
  })
  it('mantém a exclusão para iniciantes e não força poliéster quando a prioridade é conforto', () => {
    for (const a of [{ ...base, pain: 'Sim', goals: ['Conforto'] }, { ...base, pain: 'Sim', level: 'Iniciante', goals: ['Efeito (spin)'] }]) {
      const results = recommend(a)
      assert.equal(results.length, 3)
      assert.ok(results.every(r => r.mains.material !== 'Poliéster' && r.crosses.material !== 'Poliéster'))
    }
  })
  it('respeita o limite inferior quando a tensão atual já é baixa', () => {
    const results = recommend({ ...base, pain: 'Sim', tension: '30 lb', goals: ['Efeito (spin)'] })
    const poly = results.find(r => r.mains.material === 'Poliéster')!
    assert.ok(poly)
    assert.equal(poly.tensions.mains, 30)
    assert.match(poly.tensions.explanation, /limitado/)
  })
})


describe('linhas conferidas nas fichas oficiais', () => {
  it('inclui as cinco famílias solicitadas com todas as variantes técnicas conferidas', () => {
    const families: [string, string, string[]][] = [
      ['Wilson', 'Defyer', ['98 Pro', '100', '100L', '100UL']],
      ['Tecnifibre', 'Fire', ['305S', '300', '285', '270', '260 OS', '255']],
      ['Yonex', 'MUSE', ['98', '100', '100L', '100SL', '107']],
      ['Head', 'Squared', ['Squared']],
      ['Diadem', 'Axis', ['98', '100', 'Team']],
    ]
    for (const [brand, line, names] of families) {
      assert.deepEqual(rackets[brand][line].map(entry => entry.name), names)
      for (const model of rackets[brand][line]) {
        assert.equal(model.patterns.length, 1)
        assert.ok(model.headSize && model.source?.startsWith('https://'))
      }
    }
  })
  it('usa os padrões reais em vez de herdar 16 × 19 e as áreas verificadas no cálculo', () => {
    for (const name of ['98', '100', '100L', '100SL', '107']) assert.deepEqual(getPatterns('Yonex', 'MUSE', name), ['16 × 18'])
    assert.deepEqual(getPatterns('Wilson', 'Defyer', '98 Pro'), ['16 × 20'])
    assert.deepEqual(getPatterns('Wilson', 'Defyer', '100L'), ['16 × 19'])
    assert.deepEqual(getPatterns('Head', 'Squared', 'Squared'), ['16 × 18'])
    assert.deepEqual(getPatterns('Diadem', 'Axis', '98'), ['16 × 20'])
    assert.deepEqual(getPatterns('Diadem', 'Axis', 'Team'), ['16 × 19'])
    assert.equal(getHeadSize('Tecnifibre', 'Fire', '305S'), 98)
    assert.equal(getHeadSize('Tecnifibre', 'Fire', '260 OS'), 110)
    assert.equal(getHeadSize('Head', 'Squared', 'Squared'), 100)
    assert.equal(getHeadSize('Diadem', 'Axis', 'Team'), 100)
    const results = recommend({ ...base, racket: 'Yonex · MUSE · 107', pattern: getPatterns('Yonex', 'MUSE', '107')[0], headSize: getHeadSize('Yonex', 'MUSE', '107'), goals: [launchLow] })
    assert.equal(results.length, 3)
    assert.match(results[0].tensions.explanation, /MUSE.*16 × 18.*107 pol²/)
  })
  it('complementa a revisão sem apagar modelos existentes', () => {
    assert.equal(getHeadSize('Wilson', 'RF 01', 'Pro'), 98)
    assert.deepEqual(getPatterns('Babolat', 'Pure Aero', '98'), ['16 × 20'])
    assert.ok(rackets.Babolat['Pure Aero'].some(model => model.name === 'Team'))
    assert.ok(rackets.Wilson.Blade.some(model => model.name === '98'))
    assert.deepEqual(getPatterns('Pro Kennex', 'Q+', '5 Pro'), ['16 × 20'])
    assert.equal(getHeadSize('Pro Kennex', 'Q+', '30'), 119)
    assert.equal(recommend({ ...base, headSize: 119 })[0].tensions.explanation.includes('119 pol²'), true)
  })
})

describe('custo-benefício obrigatório e comparação de custo', () => {
  it('sempre reserva uma opção de custo-benefício, sem perder diversidade e filtros', () => {
    for (const goals of improvementFactors.map(goal => [goal])) for (const level of ['Iniciante','Intermediário','Avançado']) for (const pain of ['Sim','Não']) for (const layout of ['Full bed','Híbrido']) {
      const result = recommend({ ...base, goals, level, pain, layout, mains: 'Tripa natural', crosses: 'Poliéster', mainsTension: '52 lb', crossesTension: '48 lb' })
      assert.equal(result.length,3)
      assert.equal(new Set(result.map(r=>r.id)).size,3)
      assert.equal(result.filter(r=>r.isValueOption).length,1)
      assert.ok(result.every(r=>r.costComparison.includes('Setup atual:')))
      if (level === 'Iniciante') assert.ok(result.every(r=>r.mains.material !== 'Poliéster' && r.crosses.material !== 'Poliéster'))
      if (pain === 'Sim') assert.ok(result.filter(r=>r.mains.material === 'Poliéster' || r.crosses.material === 'Poliéster').length <= 1)
    }
  })
  it('reduzir custo compara com o setup premium, e a opção econômica usa faixa menor', () => {
    const result = recommend({ ...base, goals: ['Reduzir o custo','Conforto'], previous: 'Tripa natural', previousBrand: 'Babolat', previousModel: 'Touch VS' })
    const value = result.find(r=>r.isValueOption)!
    assert.ok(value)
    assert.match(value.costComparison,/Setup atual: faixa premium/)
    assert.match(value.costComparison,/Faixa indicativa menor/)
    assert.match(recommendationText(value),/Opção de custo-benefício/)
    assert.match(recommendationText(value),/não calculamos economia em R\$/)
  })
  it('não promete redução quando o setup inicial já é econômico', () => {
    const result = recommend({ ...base, goals: ['Reduzir o custo'], previous: 'Synthetic gut (nylon)', previousBrand: 'Prince', previousModel: 'Synthetic Gut with Duraflex' })
    const value = result.find(r=>r.isValueOption)!
    assert.equal(value.id,'nylon')
    assert.match(value.costComparison,/não há economia demonstrada/)
  })
  it('usa os modelos especificados e as duas direções do híbrido na referência de custo', () => {
    const result = recommend({ ...base, goals: ['Reduzir o custo'], layout:'Híbrido', mains:'Tripa natural', crosses:'Poliéster', mainsBrand:'Babolat', mainsModel:'Touch VS', crossesBrand:'Luxilon', crossesModel:'ALU Power', mainsTension:'52 lb', crossesTension:'50 lb' })
    assert.match(result[0].costComparison,/Setup atual: faixa alta a premium/)
    const full = recommend({ ...base, goals:['Reduzir o custo'], previous:'Multifilamento', previousBrand:'Tecnifibre', previousModel:'X-One Biphase' })
    assert.match(full[0].costComparison,/Setup atual: faixa alta/)
  })
})

describe('limite de pontos a preservar', () => {
  it('permite três fatores, bloqueia o quarto e libera a troca após desmarcar', () => {
    let selected = ['Conforto', 'Controle', 'Durabilidade']
    assert.deepEqual(togglePreference(selected, 'Potência', 3), selected)
    assert.equal(canSelectPreference(selected, 'Potência', 3), false)
    selected = togglePreference(selected, 'Controle', 3)
    assert.deepEqual(togglePreference(selected, 'Potência', 3), ['Conforto', 'Durabilidade', 'Potência'])
    assert.equal(canSelectPreference(['Conforto','Controle','Durabilidade'], nothingLiked, 3), true)
    assert.deepEqual(togglePreference(['Conforto','Controle','Durabilidade'], nothingLiked, 3), [nothingLiked])
  })
  it('mantém exclusão entre ângulos e valida o limite no motor', () => {
    assert.deepEqual(togglePreference(['Conforto','Controle',launchLow], launchHigh, 3), ['Conforto','Controle',launchHigh])
    assert.equal(recommend({ ...base, liked: ['Conforto','Controle','Durabilidade'] }).length, 3)
    assert.deepEqual(recommend({ ...base, liked: ['Conforto','Controle','Durabilidade','Potência'] }), [])
  })
})


describe('ordenação de opções', () => {
  it('ordena nomes em português e números naturalmente sem alterar os catálogos', () => {
    const models = ['100L','98','100','95']
    assert.deepEqual(sortOptions(models), ['95','98','100','100L'])
    assert.deepEqual(models, ['100L','98','100','95'])
    assert.deepEqual(sortOptions(['Yonex','HEAD','Babolat','Diadem','Tecnifibre']), ['Babolat','Diadem','HEAD','Tecnifibre','Yonex'])
    assert.deepEqual(sortOptions(['Potência','Ângulo de saída alto','Controle']), ['Ângulo de saída alto','Controle','Potência'])
    assert.deepEqual(sortOptions(['Hyper-G Soft','Confidential','Hyper-G']), ['Confidential','Hyper-G','Hyper-G Soft'])
  })
})
