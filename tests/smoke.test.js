import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
process.env.NODE_ENV='test';
process.env.DB_DIALECT='sqlite';
process.env.SQLITE_STORAGE=':memory:';
process.env.SESSION_SECRET='test-session-secret';
process.env.DATA_ENCRYPTION_KEY='test-encryption-secret';
const [{default:app},{sequelize,syncDatabase},{analyseText},{determineCareState}]=await Promise.all([
  import('../src/app.js'),import('../src/models/index.js'),import('../src/services/riskService.js'),import('../src/services/orchestratorService.js')
]);

test.before(async()=>{await syncDatabase({force:true});});
test.after(async()=>{await sequelize.close();});

test('public home renders',async()=>{const res=await request(app).get('/');assert.equal(res.status,200);assert.match(res.text,/Support for the part that comes/);});

test('protected app redirects to login',async()=>{const res=await request(app).get('/app');assert.equal(res.status,302);assert.equal(res.headers.location,'/login');});

test('high risk language routes to a human-required state',()=>{const analysis=analyseText('I cannot go on and I feel hopeless');assert.equal(analysis.riskLevel,'high');const state=determineCareState({riskLevel:analysis.riskLevel,emotion:analysis.emotion,capacity:'little'});assert.equal(state.humanRequired,true);assert.equal(state.mode,'stabilisation');});

test('crisis language does not route as ordinary AI support',()=>{const analysis=analyseText('I want to die');assert.equal(analysis.riskLevel,'crisis');const state=determineCareState({riskLevel:analysis.riskLevel,emotion:analysis.emotion,capacity:'not_much'});assert.equal(state.humanRequired,true);assert.equal(state.mode,'crisis');});
