import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { pixCode } from '../src/pix.ts'

function fields(payload: string): Map<string,string> {
  const result = new Map<string,string>()
  let offset=0
  while(offset<payload.length){
    assert.match(payload.slice(offset,offset+4),/^\d{4}$/)
    const length=Number(payload.slice(offset+2,offset+4))
    assert.ok(offset+4+length<=payload.length)
    result.set(payload.slice(offset,offset+2),payload.slice(offset+4,offset+4+length))
    offset+=4+length
  }
  assert.equal(offset,payload.length)
  return result
}
describe('Pix Copia e Cola',()=>{
  it('contains a complete Pix payload without a fixed amount',()=>{
    assert.ok(pixCode.startsWith('000201') && pixCode.toLowerCase().includes('br.gov.bcb.pix'))
    const data=fields(pixCode)
    assert.equal(data.get('53'),'986')
    assert.equal(data.get('58'),'BR')
    assert.ok(!data.has('54'))
    assert.ok(data.get('63')?.length===4)
  })
  it('retains a valid CRC16 checksum including every payment field',()=>{
    assert.equal(pixCode.slice(-8,-4),'6304')
    let crc=0xffff
    for(const byte of new TextEncoder().encode(pixCode.slice(0,-4))){
      crc^=byte<<8
      for(let bit=0;bit<8;bit++)crc=crc&0x8000?((crc<<1)^0x1021)&0xffff:(crc<<1)&0xffff
    }
    assert.ok(crc.toString(16).padStart(4,'0').toUpperCase()===pixCode.slice(-4).toUpperCase())
  })
})
