const { expect } = require('chai')

const Schema = require('../src/schema');
const { DateType } = require('../src/schemaTypes');

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

		expect(testSchema.toJsonSchema()).to.deep.equal({
			type: 'object',
			properties: {
				hello: { type: 'number' },
				goodbye: { type: 'string' },
				here: { type: 'string', format: 'date-time' }
			}
		})
	})

	it('Post Parse', function () 
	{
		const testSchema = new Schema('test', {
			type: Object,
			properties: {
				date: { type: Date },
				dates: [Date],
			}
		})

		const date = new Date();
		const postParse = {
			date,
			dates: [date, date, date]
		}
		const preParse = JSON.parse(JSON.stringify(postParse));

		testSchema.postParse(preParse)

		expect(preParse).to.deep.equal(postParse);
	})

	it('JSON Schema Validation', function ()
	{
		const testSchema = new Schema('test', {
			type: Object,
			properties: {
				hello: Number,
				goodbye: { type: String },
				here: { type: Date },
			}
		})

		expect(testSchema.validateJSON({
			hello: 1,
			goodbye: "Yo?",
			here: JSON.parse(JSON.stringify(new Date()))
		})).to.equal(true)
	})
})