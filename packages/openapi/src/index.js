const { rp, Route } = require('./route');

class OpenAPI
{
	//Todo: Servers
	constructor(info, routes)
	{
		this.info = info;
		this.routes = routes;
	}

	toDocument()
	{
		const result = {
			openapi: '3.0.0',
			info: this.info,
			components: {
				schemas: {}
			},
			paths: {},
		};

		for (let route of this.routes)
		{
			route.applyToDocument(result);
		}


		return result;
	}
}

module.exports = { OpenAPI, Route, rp };