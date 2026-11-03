import test from 'node:test';
import assert from 'node:assert/strict';
import { box, buildSolid, depthSort, project, COS30, render, byId } from '../../kit/dist/index.js';

test('projection matches documented formula and view ray',()=>{
  const [x,y]=project([3,2,1],10);
  assert.ok(Math.abs(x-2*COS30*10)<1e-9);
  assert.equal(y,0);
  assert.deepEqual(project([1,1,1]),project([4,4,4]));
});
test('depthSort draws separated nearer solids later',()=>{
  const far=buildSolid(box([0,0,0],[1,1,1]),'far');
  const near=buildSolid(box([1,0,0],[1,1,1]),'near');
  const r=depthSort([near,far]);
  assert.equal(r.cycles,0);
  assert.deepEqual(r.order.map(s=>s.key),['far','near']);
});
test('face roles and facing affect actual geometry',()=>{
  const d=byId('printer');
  const a=render(d,{id:'a',style:'two-tone'});
  const b=render(d,{id:'a',style:'stroke'});
  const c=render(d,{id:'a',style:'two-tone',facing:'left'});
  assert.notEqual(a.body,b.body);
  assert.notEqual(a.body,c.body);
});
