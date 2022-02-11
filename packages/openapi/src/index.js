const { rp, Route } = require('./route');
const { catchErrors } = require('./util');

const { openIdConnect } = require('./security');

class OpenAPI
{
	//Todo: Servers
	constructor(info, servers, routes, security = [])
	{
		this.info = info;
		this.routes = routes;
		this.servers = servers;
		this.security = security;
	}

	toDocument()
	{
		const result = {
			openapi: '3.0.0',
			info: this.info,
			servers: this.servers,
			components: {
				schemas: {}
			},
			security: [],
			paths: {},
		};

		for (let route of this.routes)
		{
			route.applyToDocument(result);
		}


		const documentSecurity = this.security.map((sh) => sh.toDocument());

		result.security = documentSecurity;

		return result;
	}

	applyRoutes(router)
	{
		for (let route of this.routes)
		{
			route.applyRoute(router);
		}
	}
}

module.exports = { OpenAPI, Route, rp, catchErrors, openIdConnect };