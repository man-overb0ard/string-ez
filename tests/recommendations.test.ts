import { recommendationStrings } from '../src/recommendationStrings.ts'
import { recommendationSetups } from '../src/recommendations.ts'
import { stringAppearance } from '../src/stringAppearance.ts'
import { sortOptions } from '../src/sortOptions.ts'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { factors, recommend, recommendationText, type Answers } from '../src/recommendations.ts'
import { stringCatalog, specifyString, findString, resolveStringMaterial } from '../src/stringCatalog.ts'
import { improvementFactors, nothingLiked, togglePreference, canSelectPreference } from '../src/preferences.ts'
import { rackets, getHeadSize, getPatterns } from '../src/rackets.ts'
const base: Answers = { level: 'Intermediário', racket: 'VCORE 98', pattern: '16 × 19', previous: 'Poliéster', tension: '50 lb', goals: ['Controle'], pain: 'Não', layout: 'Full bed', liked: [] }

describe('configurações recomendadas', () => {
  it('gera três configurações únicas, com produtos e tensões inteiras, em todos os perfis válidos', () => {
    for (const level of ['Iniciante', 'Intermediário', 'Avançado'])
      for (const pain of ['Sim', 'Não'])
        for (const goal of ['Conforto', 'Controle', 'Potência', 'Spin', 'Durabilidade'])
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
    assert.notDeepEqual(plain.map(r => r.id), recommend({ ...base, liked: ['Potência'] }).map(r => r.id))
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
    const samePoly = softCurrent.find(r => r.id === recommend(base)[0].id)
    assert.ok(samePoly)
    assert.ok(samePoly.tensions.mains < recommend(base).find(r => r.id === samePoly.id)!.tensions.mains)
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


describe('dois objetivos, snapback e contexto da raquete', () => {
  it('combina dois objetivos com o mesmo peso e sem depender da ordem de seleção', () => {
    const first = recommend({ ...base, goals: ['Controle', 'Potência'] })
    const second = recommend({ ...base, goals: ['Potência', 'Controle'] })
    assert.deepEqual(first.map(r => [r.id, r.tensions.mains, r.tensions.crosses]), second.map(r => [r.id, r.tensions.mains, r.tensions.crosses]))
    for (const r of first) {
      assert.match(r.reason, /controle e potência/)
      assert.match(r.tensions.explanation, /mesmo peso/)
      assert.match(recommendationText(r), /Controle e Potência/)
    }
    const sameMaterial = recommend({ ...base, previous: 'Multifilamento', goals: ['Controle', 'Potência'] }).find(r => r.layout === 'Full bed' && r.mains.material === 'Multifilamento')!
    assert.ok(sameMaterial)
    assert.equal(sameMaterial.tensions.mains, 50) // +controle e -potência se compensam no mesmo material.
  })
  it('cada combinação válida de objetivos produz três opções e respeita os filtros do perfil', () => {
    for (let i = 0; i < improvementFactors.length; i++) for (let j = i; j < improvementFactors.length; j++) {
      const goals = [...new Set([improvementFactors[i], improvementFactors[j]])]
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
  it('distingue snapback de spin na ordenação sem ajustar tensão só pelo snapback', () => {
    const snapback = recommend({ ...base, goals: ['Snapback'] })
    const spin = recommend({ ...base, goals: ['Spin'] })
    assert.equal(snapback[0].scores.Snapback, 5)
    assert.equal(spin[0].scores.Spin, 5)
    assert.notEqual(snapback[0].id, spin[0].id)
    assert.equal(snapback[0].tensions.mains, 50)
    assert.match(snapback[0].tensions.explanation, /não medições de atrito/)
    assert.match(snapback[0].reason, /não garantia de mais spin/)
    assert.match(snapback.find(r => r.isValueOption)!.reason, /snapback/)
  })
  it('considera snapback a preservar e mantém contexto real da raquete', () => {
    assert.equal(recommend({ ...base, liked: ['Snapback'] })[0].scores.Snapback, 5)
    assert.equal(recommend({ ...base, liked: ['Spin'] })[0].scores.Spin, 5)
    assert.equal(getHeadSize('Yonex', 'VCORE', '98'), 98)
    const dense = recommend({ ...base, headSize: 98, pattern: '18 × 20', goals: ['Conforto'] })
    const open = recommend({ ...base, headSize: 98, pattern: '16 × 19', goals: ['Conforto'] })
    const shared = dense.find(r => open.some(other => other.id === r.id))!
    assert.equal(shared.tensions.mains, open.find(r => r.id === shared.id)!.tensions.mains - 1)
    assert.match(shared.tensions.explanation, /18 × 20.*98 pol²/)
  })
  it('usa Preço e Spin e retira os ângulos dos dois questionários', () => {
    assert.ok(factors.includes('Preço') && factors.includes('Spin') && factors.includes('Snapback'))
    assert.ok(improvementFactors.includes('Snapback') && improvementFactors.includes('Spin'))
    assert.ok(![...factors,...improvementFactors].some(f => f.includes('Ângulo') || f === 'Custo-benefício' || f === 'Efeito (spin)'))
    assert.ok(recommend({ ...base, liked: ['Preço'] }).some(r => r.isValueOption))
  })
  it('limita a dois objetivos sem substituir uma escolha quando está no máximo', () => {
    assert.deepEqual(togglePreference(['Controle', 'Spin'], 'Snapback', 2), ['Controle', 'Spin'])
    assert.equal(canSelectPreference(['Controle', 'Spin'], 'Snapback', 2), false)
    assert.deepEqual(togglePreference(['Snapback'], nothingLiked), [nothingLiked])
    assert.deepEqual(togglePreference([nothingLiked], 'Snapback'), ['Snapback'])
    for (const goals of [[], ['Controle','Conforto','Potência'], ['Ângulo de saída baixo']]) assert.deepEqual(recommend({ ...base, goals }), [])
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
    for (const goals of [['Spin'], ['Controle', 'Spin']]) {
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
    const results = recommend({ ...base, pain: 'Sim', layout: 'Híbrido', mains: 'Tripa natural', crosses: 'Poliéster', mainsTension: '50 lb', crossesTension: '40 lb', goals: ['Snapback'] })
    const hybrid = results.find(r => r.layout === 'Híbrido' && r.crosses.material === 'Poliéster')!
    assert.ok(hybrid)
    assert.equal(hybrid.tensions.mains, 48)
    assert.equal(hybrid.tensions.crosses, 36)
    assert.match(hybrid.tensionComparison, /Crosses: 40 → 36 lb/)
  })
  it('mantém a exclusão para iniciantes e não força poliéster quando a prioridade é conforto', () => {
    for (const a of [{ ...base, pain: 'Sim', goals: ['Conforto'] }, { ...base, pain: 'Sim', level: 'Iniciante', goals: ['Spin'] }]) {
      const results = recommend(a)
      assert.equal(results.length, 3)
      assert.ok(results.every(r => r.mains.material !== 'Poliéster' && r.crosses.material !== 'Poliéster'))
    }
  })
  it('respeita o limite inferior quando a tensão atual já é baixa', () => {
    const results = recommend({ ...base, pain: 'Sim', tension: '30 lb', goals: ['Spin'] })
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
    const results = recommend({ ...base, racket: 'Yonex · MUSE · 107', pattern: getPatterns('Yonex', 'MUSE', '107')[0], headSize: getHeadSize('Yonex', 'MUSE', '107'), goals: ['Controle'] })
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
    assert.equal(result[0].mains.material,'Synthetic gut (nylon)')
    assert.match(result[0].costComparison,/não há economia demonstrada/)
    assert.notEqual(value.id, result[0].id)
    assert.match(value.costComparison,/não há economia demonstrada|Faixa indicativa maior/)
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
  it('valida o limite no motor incluindo snapback', () => {
    assert.deepEqual(togglePreference(['Conforto','Controle','Snapback'], 'Spin', 3), ['Conforto','Controle','Snapback'])
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

describe('preferências de cor e formato', () => {
  const color = 'Cor da corda', shape = 'Formato (Redondo, Hexagonal, etc.)'
  it('exige detalhes válidos e conta cor e formato no limite de três', () => {
    assert.deepEqual(recommend({ ...base, liked: [color] }), [])
    assert.deepEqual(recommend({ ...base, liked: [shape], preferredShape: 'Inventado' }), [])
    assert.deepEqual(recommend({ ...base, liked: [color], preferredColor: 'Inventada' }), [])
    assert.deepEqual(recommend({ ...base, liked: [color, shape, 'Controle', 'Conforto'], preferredColor: 'Preta', preferredShape: 'Redondo' }), [])
    assert.equal(recommend({ ...base, liked: [color, shape, 'Controle'], preferredColor: 'Preta', preferredShape: 'Redondo' }).length, 3)
  })
  it('favorece verde/quadrado, inclui hexagonal e explica as concessões de custo', () => {
    const green = recommend({ ...base, liked: [color, shape], preferredColor: 'Verde', preferredShape: 'Quadrado' })
    assert.ok(green.some(r => r.mains.model.includes('Hyper-G')))
    assert.ok(green.find(r => r.isValueOption)?.appearanceNote.includes('Não preserva a cor verde'))
    const hex = recommend({ ...base, liked: [shape], preferredShape: 'Hexagonal' })
    assert.ok(hex.some(r => r.mains.model === 'Lynx Tour'))
    assert.ok(hex.every(r => recommendationText(r).includes(r.appearanceNote)))
  })
  it('ignora detalhes desmarcados e mantém os filtros de iniciante e desconforto', () => {
    assert.deepEqual(recommend({ ...base, preferredColor: 'Verde', preferredShape: 'Hexagonal' }), recommend(base))
    for (const level of ['Iniciante', 'Intermediário']) for (const pain of ['Sim', 'Não']) {
      const result = recommend({ ...base, level, pain, liked: [color, shape], preferredColor: 'Verde', preferredShape: 'Hexagonal' })
      assert.equal(result.length, 3)
      assert.equal(new Set(result.map(r => r.id)).size, 3)
      assert.equal(result.filter(r => r.isValueOption).length, 1)
      const polys = result.filter(r => [r.mains, r.crosses].some(s => s.material === 'Poliéster'))
      if (level === 'Iniciante') assert.equal(polys.length, 0)
      if (pain === 'Sim') assert.ok(polys.length <= 1)
    }
  })
})

describe('pocketing', () => {
  it('participa dos dois questionários e favorece combinações elásticas com explicação', () => {
    assert.ok(factors.includes('Pocketing') && improvementFactors.includes('Pocketing'))
    const result = recommend({ ...base, goals: ['Pocketing'] })
    assert.equal(result[0].scores.Pocketing, 5)
    assert.equal(result[0].mains.material, 'Multifilamento')
    assert.match(result[0].reason, /maior pocketing/)
    assert.match(result[0].tensions.explanation, /não é uma medição|Não é uma medição/)
    assert.match(recommendationText(result[0]), /Pocketing/)
    assert.equal(recommend({ ...base, liked: ['Pocketing'], goals: ['Controle'] }).length, 3)
  })
  it('combina pocketing e snapback sem perder limites de perfil ou custo-benefício', () => {
    for (const level of ['Iniciante','Intermediário']) for (const pain of ['Sim','Não']) {
      const result = recommend({ ...base, level, pain, goals: ['Pocketing','Snapback'], liked: ['Preço','Spin','Pocketing'] })
      assert.equal(result.length, 3)
      assert.equal(result.filter(r=>r.isValueOption).length, 1)
      assert.ok(result.every(r=>/pocketing/i.test(r.reason) && /snapback/i.test(r.reason)))
      const polys = result.filter(r=>r.mains.material==='Poliéster'||r.crosses.material==='Poliéster')
      if (level==='Iniciante') assert.equal(polys.length,0)
      if (pain==='Sim') assert.ok(polys.length<=1)
    }
  })
})

describe('tripa natural somente para quem já usa', () => {
  const hasGut = (r: ReturnType<typeof recommend>[number]) => [r.mains, r.crosses].some(s => s.material === 'Tripa natural')
  it('exclui tripa natural em qualquer direção sem perder três opções e custo-benefício', () => {
    for (const previous of ['Poliéster','Multifilamento','Synthetic gut (nylon)'])
      for (const level of ['Iniciante','Intermediário','Avançado'])
        for (const pain of ['Sim','Não'])
          for (const goal of improvementFactors) {
            const result = recommend({ ...base, previous, level, pain, goals: [goal] })
            assert.equal(result.length,3)
            assert.equal(new Set(result.map(r=>r.id)).size,3)
            assert.ok(result.every(r=>!hasGut(r)))
            assert.equal(result.filter(r=>r.isValueOption).length,1)
          }
  })
  it('mantém tripa natural elegível em full bed ou em qualquer direção do híbrido atual', () => {
    const profiles: Answers[] = [
      { ...base, previous:'Tripa natural', goals:['Conforto','Potência'] },
      { ...base, layout:'Híbrido', mains:'Tripa natural', crosses:'Poliéster', mainsTension:'52 lb', crossesTension:'48 lb', goals:['Conforto','Potência'] },
      { ...base, layout:'Híbrido', mains:'Poliéster', crosses:'Tripa natural', mainsTension:'48 lb', crossesTension:'52 lb', goals:['Conforto','Potência'] },
    ]
    for (const profile of profiles) assert.ok(recommend(profile).some(hasGut))
  })
  it('usa apenas o setup ativo e não permite que cor, formato ou snapback contornem o filtro', () => {
    const hybrid = recommend({ ...base, previous:'Tripa natural', layout:'Híbrido', mains:'Multifilamento', crosses:'Synthetic gut (nylon)', mainsTension:'50 lb', crossesTension:'48 lb', goals:['Pocketing','Snapback'], liked:['Cor da corda','Formato (Redondo, Hexagonal, etc.)'], preferredColor:'Natural', preferredShape:'Redondo' })
    assert.equal(hybrid.length,3)
    assert.ok(hybrid.every(r=>!hasGut(r)))
    const full = recommend({ ...base, mains:'Tripa natural', crosses:'Tripa natural', goals:['Pocketing','Snapback'] })
    assert.ok(full.every(r=>!hasGut(r)))
  })
})

describe('ordem das três recomendações', () => {
  it('prioriza a pontuação na primeira e escolhe a montagem oposta na segunda', () => {
    const baseline = recommend(base)
    assert.equal(baseline[0].scores.Controle, 5)
    assert.notEqual(baseline[0].layout, baseline[1].layout)
    const hybridFirst = recommend({ ...base, previous:'Tripa natural', goals:['Spin','Snapback'] })
    assert.ok(hybridFirst[0].scores.Spin >= 4 && hybridFirst[0].scores.Snapback >= 4)
    assert.notEqual(hybridFirst[0].layout, hybridFirst[1].layout)
    assert.equal(hybridFirst[2].isValueOption,true)
    const valueFirst = recommend({ ...base, goals:['Reduzir o custo'] })
    assert.equal(valueFirst[0].scores.Preço, 5)
    assert.equal(valueFirst[1].layout,'Híbrido')
    assert.notEqual(valueFirst[2].id, valueFirst[0].id)
    assert.equal(valueFirst[2].isValueOption,true)
  })
  it('mantém as posições, unicidade e filtros em todas as combinações de objetivos e perfis', () => {
    for (let i=0;i<improvementFactors.length;i++) for (let j=i;j<improvementFactors.length;j++)
      for (const level of ['Iniciante','Intermediário','Avançado']) for (const pain of ['Sim','Não'])
        for (const previous of ['Poliéster','Tripa natural']) {
          const result=recommend({ ...base, goals:[...new Set([improvementFactors[i],improvementFactors[j]])],level,pain,previous })
          assert.equal(result.length,3)
          assert.equal(new Set(result.map(r=>r.id)).size,3)
          if(level==='Iniciante')assert.ok(result.every(r=>r.layout==='Full bed'))
          else assert.notEqual(result[0].layout,result[1].layout)
          assert.deepEqual(result.map(r=>r.isValueOption),[false,false,true])
          assert.ok(result[2].scores.Preço>=4)
          const polys=result.filter(r=>[r.mains,r.crosses].some(s=>s.material==='Poliéster'))
          if(level==='Iniciante')assert.equal(polys.length,0)
          if(pain==='Sim')assert.ok(polys.length<=1)
          if(previous!=='Tripa natural')assert.ok(result.every(r=>[r.mains,r.crosses].every(s=>s.material!=='Tripa natural')))
        }
  })
  it('não favorece a primeira opção por montagem ou material atuais', () => {
    const profiles: Answers[] = [
      {...base,previous:'Poliéster'},
      {...base,previous:'Multifilamento'},
      {...base,layout:'Híbrido',mains:'Poliéster',crosses:'Multifilamento',mainsTension:'50 lb',crossesTension:'50 lb'},
    ]
    for(const profile of profiles)assert.equal(recommend(profile)[0].id,recommend(base)[0].id)
    const pain=recommend({...base,pain:'Sim'})
    assert.notEqual(pain[0].layout,pain[1].layout)
    assert.ok(pain.filter(r => [r.mains,r.crosses].some(s=>s.material==='Poliéster')).length <= 1)
  })
})

describe('frequência semanal', () => {
  const frequencies = ['Até 2 horas','Mais de 2 até 5 horas','Mais de 5 até 10 horas','Mais de 10 horas']
  it('muda a escolha ao ponderar desgaste e preço, mantendo explicação e resumo', () => {
    const low=recommend({...base,goals:['Reduzir o custo'],weeklyHours:frequencies[0]})
    const high=recommend({...base,goals:['Reduzir o custo'],weeklyHours:frequencies[3]})
    assert.notEqual(low[0].id,high[0].id)
    assert.ok(high[0].scores.Durabilidade >= low[0].scores.Durabilidade)
    assert.ok(low.every(r=>r.frequencyNote.includes('manutenção de tensão')))
    assert.ok(high.every(r=>r.frequencyNote.includes('resistência ao desgaste')))
    assert.ok(high.every(r=>recommendationText(r).includes(frequencies[3])))
    assert.deepEqual(recommend({...base,weeklyHours:'Mais de 99 horas'}),[])
    assert.deepEqual(recommend({...base,weeklyHours:''}),[])
  })
  it('a frequência sozinha não altera a tensão do mesmo setup', () => {
    const low=recommend({...base,weeklyHours:frequencies[0]})
    for(const weeklyHours of frequencies)for(const r of recommend({...base,weeklyHours})){
      const same=low.find(other=>other.id===r.id)
      if(same)assert.deepEqual(r.tensions,same.tensions)
    }
  })
  it('preserva posições e filtros em todas as frequências, objetivos e perfis', () => {
    for(const weeklyHours of frequencies)for(const level of ['Iniciante','Intermediário','Avançado'])
      for(const pain of ['Sim','Não'])for(const previous of ['Poliéster','Tripa natural'])for(const goal of improvementFactors){
        const result=recommend({...base,weeklyHours,level,pain,previous,goals:[goal]})
        assert.equal(result.length,3)
        assert.equal(new Set(result.map(r=>r.id)).size,3)
        assert.deepEqual(result.map(r=>r.isValueOption),[false,false,true])
        if(level==='Iniciante')assert.ok(result.every(r=>r.layout==='Full bed'&&[r.mains,r.crosses].every(s=>s.material!=='Poliéster')))
        else assert.notEqual(result[0].layout,result[1].layout)
        if(pain==='Sim')assert.ok(result.filter(r=>[r.mains,r.crosses].some(s=>s.material==='Poliéster')).length<=1)
        if(previous!=='Tripa natural')assert.ok(result.every(r=>[r.mains,r.crosses].every(s=>s.material!=='Tripa natural')))
      }
  })
})

describe('trajetória predominante da bola', () => {
  const styles=['Mais reta','Com arco e topspin','Mais alta e profunda']
  it('usa o estilo como ajuste complementar e diferencia controle, rotação e profundidade', () => {
    const results=styles.map(shotStyle=>recommend({...base,goals:['Conforto','Controle'],shotStyle}))
    assert.ok(results[1][0].scores.Spin > results[0][0].scores.Spin)
    assert.ok(results[2][0].scores.Potência > results[0][0].scores.Potência)
    assert.match(results[0][0].shotStyleNote,/controle de profundidade/)
    assert.match(results[1][0].shotStyleNote,/spin, snapback/)
    assert.match(results[2][0].shotStyleNote,/também pode ter muito topspin/)
    assert.ok(results.every(rs=>rs.every(r=>recommendationText(r).includes(r.shotStyleNote))))
    assert.deepEqual(recommend({...base,shotStyle:''}),[])
    assert.deepEqual(recommend({...base,shotStyle:'Inválido'}),[])
  })
  it('não muda a tensão de um mesmo setup só pela trajetória', () => {
    const original=recommend(base)
    for(const shotStyle of styles)for(const r of recommend({...base,shotStyle})){
      const same=original.find(other=>other.id===r.id)
      if(same)assert.deepEqual(r.tensions,same.tensions)
    }
  })
  it('combina trajetórias e frequência sem perder posições e filtros de material', () => {
    for(const shotStyle of styles)for(const weeklyHours of ['Até 2 horas','Mais de 10 horas'])
      for(const level of ['Iniciante','Intermediário','Avançado'])for(const pain of ['Sim','Não'])
        for(const previous of ['Poliéster','Tripa natural'])for(const goal of improvementFactors){
          const result=recommend({...base,shotStyle,weeklyHours,level,pain,previous,goals:[goal]})
          assert.equal(result.length,3)
          assert.equal(new Set(result.map(r=>r.id)).size,3)
          assert.deepEqual(result.map(r=>r.isValueOption),[false,false,true])
          assert.ok(result.every(r=>r.shotStyleNote&&r.frequencyNote))
          if(level==='Iniciante')assert.ok(result.every(r=>r.layout==='Full bed'&&[r.mains,r.crosses].every(s=>s.material!=='Poliéster')))
          else assert.notEqual(result[0].layout,result[1].layout)
          if(pain==='Sim')assert.ok(result.filter(r=>[r.mains,r.crosses].some(s=>s.material==='Poliéster')).length<=1)
          if(previous!=='Tripa natural')assert.ok(result.every(r=>[r.mains,r.crosses].every(s=>s.material!=='Tripa natural')))
        }
  })
})


describe('catálogo completo nas recomendações', () => {
  it('inclui todos os modelos e marcas da identificação, com pelo menos cem cordas distintas', () => {
    const expected = Object.entries(stringCatalog).flatMap(([brand, entries]) => entries.map(e => `${brand} ${e.model}`)).sort()
    assert.ok(expected.length >= 100)
    assert.deepEqual(recommendationStrings.map(s => `${s.brand} ${s.model}`).sort(), expected)
    assert.equal(new Set(recommendationStrings.map(s => s.id)).size, expected.length)
    assert.deepEqual(recommendationSetups.filter(s => s.layout === 'Full bed').map(s => `${s.mains.brand} ${s.mains.model}`).sort(), expected)
    assert.equal(new Set(recommendationSetups.map(s => s.id)).size, recommendationSetups.length)
    for (const s of recommendationStrings) {
      assert.equal(findString(s.brand,s.model)?.material,s.material)
      assert.ok(factors.every(f => Number.isFinite(s.scores[f]) && s.scores[f] >= 1 && s.scores[f] <= 5))
      assert.ok(stringAppearance(s).colors.length > 0)
      assert.notEqual(stringAppearance(s).shape, 'Não catalogado')
    }
  })
  it('oferece híbridos de diferentes marcas, incluindo os modelos adicionados recentemente', () => {
    for(const brand of Object.keys(stringCatalog)) assert.ok(recommendationSetups.some(s => s.layout==='Híbrido' && s.mains.brand===brand))
    for(const model of ['Mach-10','Confidential Soft','Element Soft IR','Zero','Toro Toro']) assert.ok(recommendationSetups.some(s => s.layout==='Full bed' && s.mains.model===model))
    for(const s of recommendationSetups.filter(s=>s.layout==='Híbrido'))assert.notEqual(`${s.mains.brand} ${s.mains.model}`,`${s.crosses.brand} ${s.crosses.model}`)
  })
  it('produz variedade entre perfis sem sorteio nem repetir a corda principal na opção econômica', () => {
    const winners=new Set<string>(), output=new Set<string>()
    for(const goal of improvementFactors)for(const like of factors)for(const level of ['Iniciante','Intermediário'])for(const pain of ['Sim','Não'])for(const weeklyHours of ['Até 2 horas','Mais de 10 horas']){
      const answers={...base,goals:[goal],liked:[like],level,pain,weeklyHours}
      const result=recommend(answers)
      assert.deepEqual(result,recommend(answers))
      winners.add(result[0].mains.brand+' '+result[0].mains.model)
      for(const r of result)for(const s of [r.mains,r.crosses])output.add(s.brand+' '+s.model)
      assert.notEqual(result[2].mains,result[0].mains)
      assert.notEqual(result[2].mains,result[1].mains)
    }
    assert.ok(winners.size>=20, `Apenas ${winners.size} cordas na primeira posição`)
    assert.ok(output.size>=25, `Apenas ${output.size} cordas nos resultados`)
  })
})
