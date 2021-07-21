const { expect } = require('chai')

const { Schema } = require('schema');
const { OpenAPI, Route, rp } = require('../src/index');

describe('OpenAPI JSON Document', function ()
{
	it('Basic Routes', function ()
	{
		const getRoute = new Route('testRoute', '/foo', {
			operation: 'get',
			description: 'Returns some info.',
			responses: {
				200: {
					type: Object,
					properties: {
						hello: String,
						goodbye: Number
					}
				}
			}
		})

		const openapi = new OpenAPI({
			title: "Sample Pet Store App",
			description: "This is a sample server for a pet store.",
			termsOfService: "http://example.com/terms/",
			contact: {
				"name": "API Support",
				"url": "http://www.example.com/support",
				"email": "support@example.com"
			},
			version: "1.0.1"
		}, [getRoute]);


		const doc = openapi.toDocument();

		expect(doc).to.deep.equal({
			openapi: '3.0.0',
			info: {
				title: "Sample Pet Store App",
				description: "This is a sample server for a pet store.",
				termsOfService: "http://example.com/terms/",
				contact: {
					"name": "API Support",
					"url": "http://www.example.com/support",
					"email": "support@example.com"
				},
				version: "1.0.1"
			},
			components: {
				schemas: {}
			},
			paths: {
				'/foo': {
					'get': {
						operationId: 'testRoute',
						description: 'Returns some info.',
						responses: {
							"200": {
								content: {
									"application/json": {
										schema: {
											type: "object",
											properties: {
												hello: { type: 'string' },
												goodbye: { type: 'number' }
											}
										}
									}
								}
							}
						}
					}
				}
			}
		})

	})
})