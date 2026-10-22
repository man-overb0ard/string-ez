import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { findTwuMeasurement, measuredScores, measuredGauges, twuExplanation } from '../src/twu.ts'
import { twuRecords } from '../src/twuData.ts'
import { recommendationStrings } from '../src/recommendationStrings.ts'
import { recommend, recommendationText } from '../src/recommendations.ts'

describe('TWU imported evidence',()=>{
  it('preserves source, quarantines implausible values and imports only mapped comparable measurements',()=>{
    const report=JSON.parse(readFileSync(new URL('../data/twu/import-report.json',import.meta.url),'utf8'))
    assert.equal(report.sourceRows,788)
    assert.equal(report.runtimeRows,199)
    assert.equal(report.runtimeModels,94)
    assert.equal(new Set(twuRecords.map(r=>r.model)).size,94)
    assert.ok(report.issues.some((r:{raw:unknown;action:string})=>r.raw===1275 && r.action==='quarantined'))
    assert.ok(report.issues.some((r:{raw:unknown;action:string})=>r.raw===315 && r.action==='quarantined'))
    assert.ok(report.issues.some((r:{action:string})=>r.action==='duplicate_name_excluded_from_runtime'))
    assert.ok(twuRecords.every(r=>r.nominal>=1 && r.nominal<=1.6 && r.model && r.row>=2))
    assert.ok(!twuRecords.some(r=>r.name==='Solinco Hyper-G 16')) // gauge is 16, not millimetres
    assert.ok(!twuRecords.some(r=>r.name.includes('Hyper-G 16 Round') || r.name.includes('Velocity MLT Power')))
  })
  it('matches exact nominal gauges, separates Soft and does not transfer actual diameters or colors',()=>{
    const spec={brand:'Solinco',model:'Hyper-G',gauge:'1,25 mm'}
    assert.equal(findTwuMeasurement(spec)?.stiffness,218.3)
    assert.equal(findTwuMeasurement({...spec,model:'Hyper-G Soft'})?.stiffness,172)
    assert.equal(findTwuMeasurement({...spec,gauge:'1,15 mm'})?.stiffness,180)
    assert.equal(findTwuMeasurement({...spec,gauge:'1,28 mm'}),undefined)
    assert.equal(findTwuMeasurement({brand:'Solinco',model:'Mach-10',gauge:'1,25 mm'}),undefined)
    assert.equal(findTwuMeasurement({brand:'Solinco',model:'Mach-10',gauge:'1,30 mm'})?.stiffness,222.3)
    const yonex={brand:'Yonex',model:'POLYTOUR PRO',gauge:'1,25 mm'}
    assert.equal(findTwuMeasurement(yonex,'Amarela')?.stiffness,181.2)
    assert.equal(findTwuMeasurement(yonex,'Preta'),undefined)
    assert.equal(findTwuMeasurement(yonex,'Rosa'),undefined)
  })
  it('uses laboratory measurements for supported proxies and preserves unmeasured factors and missing metrics',()=>{
    const hard=recommendationStrings.find(s=>s.model==='Hyper-G')!
    const soft=recommendationStrings.find(s=>s.model==='Hyper-G Soft')!
    const hs=measuredScores({...hard,gauge:'1,25 mm'},hard.scores)
    const ss=measuredScores({...soft,gauge:'1,25 mm'},soft.scores)
    assert.ok(ss.Conforto>hs.Conforto)
    assert.ok(hs['Manutenção de tensão']>ss['Manutenção de tensão'])
    for(const factor of ['Controle','Potência','Pocketing','Durabilidade','Preço'] as const)assert.equal(hs[factor],hard.scores[factor])
    const ptp=recommendationStrings.find(s=>s.model==='POLYTOUR PRO')!
    const partial=measuredScores({...ptp,gauge:'1,25 mm'},ptp.scores,'Amarela')
    assert.equal(partial.Spin,ptp.scores.Spin)
    assert.equal(partial.Snapback,ptp.scores.Snapback)
    assert.notEqual(partial.Conforto,ptp.scores.Conforto)
    assert.deepEqual(measuredScores({...hard,gauge:'1,29 mm'},hard.scores),hard.scores)
    assert.ok(measuredGauges({brand:'Luxilon',model:'Element Soft IR'}).includes(127))
  })
  it('ranks the selected gauge using evidence, explains fallback and copies provenance with the recommendations',()=>{
    const base={level:'Intermediário',racket:'VCORE',pattern:'16 × 19',previous:'Poliéster',tension:'50 lb',goals:['Spin'],pain:'Não'}
    const result=recommend(base)
    assert.equal(result.length,3)
    const top=findTwuMeasurement(result[0].mains)
    assert.ok(top && top.spin!==null)
    for(const r of result){
      assert.ok(r.evidenceNote)
      assert.ok(recommendationText(r).includes(r.evidenceNote))
      if(r.layout==='Full bed'){
        const source=recommendationStrings.find(s=>s.brand===r.mains.brand&&s.model===r.mains.model)!
        assert.deepEqual(r.scores,measuredScores(r.mains,source.scores))
      }else assert.match(r.evidenceNote,/híbrido não foi medido como conjunto/)
    }
    assert.match(twuExplanation({brand:'Solinco',model:'Mach-10',gauge:'1,25 mm'}),/sem ensaio correspondente/)
    const evidence=twuExplanation({brand:'Yonex',model:'POLYTOUR PRO',gauge:'1,25 mm'},'Amarela')
    assert.match(evidence,/51 lb, velocidade Fast/)
    assert.match(evidence,/nesses fatores usamos estimativas/)
    assert.match(evidence,/Não extrapolamos/)
  })
})
