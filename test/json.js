const { expect } = require('chai')

const Schema = require('../src/schema');

describe('JSON Schema', function ()
{
	it('Basic JSON Schema', function ()
	{
		const testSchema = new Schema('test', {
			type: Object,
			properties: {
				hello: Number,
				goodbye: { type: String },
				here: { type: Date },
			}
		})

		testSchema.toJsonSchema();
		expect(testSchema.toJsonSchema()).to.deep.equal({
			type: 'object',
			properties: {
				hello: { type: 'number' },
				goodbye: { type: 'string' },
				here: { type: 'string', format: 'date-time' }
			}
		})
	})
})