const { expect } = require('chai')

const { Schema } = require('schema');
const { OpenAPI, Route, rp } = require('../src/index');

describe('OpenAPI JSON Document', function ()
{
	it('Basic Routes', function ()
	{
		const getRoute = new Route('getRoute', '/foo', {
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

		const createRoute = new Route('createRoute', '/foo', {
			operation: 'post',
			description: 'Collects some info.',
			body: {
				type: Object,
				properties: {
					foo: String
				},
			},
			responses: {
				201: {
					description: "Success."
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
		}, [getRoute, createRoute]);


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
						operationId: 'getRoute',
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
					},
					'post': {
						operationId: 'createRoute',
						description: 'Collects some info.',
						requestBody: {
							content: {
								'application/json': {
									schema: {
										type: 'object',
										properties: {
											foo: { type: 'string' },
										}
									}
								}
							}
						},
						responses: {
							"201": {
								description: "Success."
							}
						}
					}
				}
			}
		})

	})
})