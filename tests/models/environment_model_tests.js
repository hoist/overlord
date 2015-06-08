'use strict';
import Environment from '../../lib/models/environment';
import mongoose from 'mongoose';
import Bluebird from 'bluebird';
import config from 'config';
import {
	expect
}
from 'chai';


Bluebird.promisifyAll(mongoose);

describe('Environment', () => {
	let environment;
	before(() => {
		return Promise.all([
			mongoose.connectAsync(config.get('Hoist.mongo.overlord')),
			new Environment({
				name: 'name',
				fleetUrl: 'http://fleet.test.hoist'
			}).saveAsync().spread((env) => {
				environment = env;
			})
		]);
	});
	after(() => {
		return Bluebird.promisify(mongoose.connection.db.dropDatabase, mongoose.connection.db)()
			.then(() => {
				return mongoose.disconnectAsync();
			});
	});
	describe('#toJSON response', () => {
		let jsonResult;
		before(() => {
			jsonResult = environment.toJSON();
		});
		it('has name', () => {
			return expect(jsonResult.name).to.eql('name');
		});
		it('has fleetUrl', () => {
			return expect(jsonResult.fleetUrl).to.eql('http://fleet.test.hoist');
		});
		it('has slug', () => {
			return expect(jsonResult.slug).to.eql('name');
		});
		it('has id', () => {
			return expect(jsonResult._id).to.eql(environment._id);
		});
	});
});
