const { expect } = require('chai')

const { Schema } = require('schema');
const axios = require('axios');
const { OpenAPI, Route, rp } = require('../src/index');

const express = require('express');

function withExpress(func)
{
	const app = express();
	return new Promise((resolve, reject) =>
	{
		const server = app.listen(async () =>
		{
			try
			{
				await func(app);
			}
			catch (err)
			{
				reject(err);
			}
			finally
			{
				server.close();
				resolve();
			}
		});
	});
}

describe('Express routes', function ()
{
	it('Get Route', async function ()
	{
		const getRoute = new Route('getRoute', rp`/foo`, {
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
			},
			handler: async (req, res, next) =>
			{
				await res.send({ hello: "hello", goodbye: 13 });
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

		await withExpress(async (app) =>
		{
			openapi.applyRoutes(app);

			const resp = await axios.get('http://localhost/foo');

			expect(resp.data).to.deep.equal({ hello: "hello", goodbye: 13 });
		});
	})
})