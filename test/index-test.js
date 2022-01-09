const fs = require('fs');
const path = require('path');
const Cloudworker = require('@dollarshaveclub/cloudworker');
const { expect } = require('chai');

const workerScript = fs.readFileSync(path.resolve(__dirname, '../index.js'), 'utf8');

describe('worker unit test', function () {
  this.timeout(60000);
  let worker;

  beforeEach(() => {
    // Create the simulated execution environment
    worker = new Cloudworker(workerScript);
  });

  it('tests requests and responses', async () => {
    const request = new Cloudworker.Request('https://mysite.com/api')
    // Pass the request through Cloudworker to simulate script exectuion
    const response = await worker.dispatch(request);
    const body = await response.text();
    expect(response.status).to.eql(200);
    expect(body).to.eql('Hello worker!');
  });
});
