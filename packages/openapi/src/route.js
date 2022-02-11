const { Schema } = require("schema");

function emitSchema(schema, doc)
{
	let schemaObj = null;

	if (schema.name)
	{
		//This is a reference
		schemaObj = { '$ref': `#/components/schemas/${schema.name}` };

		//Add the reference manually
		if (!(schema.name in doc.components.schemas))
		{
			doc.components.schemas[schema.name] = schema.toJsonSchema(true, doc.components.schemas, "#/components/schemas");
		}
	}
	else
	{
		//This is an inline schema
		//TODO: Handle refs
		schemaObj = schema.toJsonSchema(true, doc.components.schemas, "#/components/schemas");
	}

	return schemaObj;
}

class OpenAPIContent
{
	constructor(schema)
	{
		this.content = schema instanceof Schema ? schema : new Schema(null, schema)
	}

	toDocument(doc)
	{
		return {
			'application/json': {
				"schema": emitSchema(this.content, doc)
			}
		}
	}
}



class RouteResponse
{
	constructor(code, content, description)
	{
		this.code = code;
		this.content = content ? new OpenAPIContent(content) : null;
		this.description = description;
	}

	toDocument(doc)
	{
		const result = {};

		if (this.content)
			result.content = this.content.toDocument(doc);

		if (this.description)
			result.description = this.description;

		return result;
	}
}

class RouteParameter
{
	constructor(name, schema, description, required)
	{
		this.name = name;
		this.schema = schema instanceof Schema ? schema : new Schema(null, schema);
		this.description = description;
		this.required = !!required;
	}

	toDocument(doc)
	{
		const result = {
			name: this.name,
			schema: emitSchema(this.schema, doc),
			required: this.required,
		};

		if (this.description)
			result.description = this.description;

		return result;
	}
}

class RouteBody
{
	constructor(description, contentSchema)
	{
		this.description = description;
		this.contentSchema = contentSchema ? new OpenAPIContent(contentSchema) : null;
	}

	toDocument(doc)
	{
		const result = {};

		if (this.description)
			result.description = this.description;

		if (this.contentSchema)
			result.content = this.contentSchema.toDocument(doc);

		return result;
	}
}

function rp(strings, ...params)
{
	let pathString = "";

	for (let i = 0; i < strings.length; ++i)
	{
		pathString += strings[i];
		if (params[i])
		{
			pathString += `:${params[i].name}`
		}
	}

	return {
		pathString,
		params
	}
}

class Route
{
	//TODO: Security handlers
	//TODO: Headers


	constructor(operationId, path, spec)
	{
		this.operation = spec.operation;
		this.operationId = operationId;
		this.responses = {};
		this.description = spec.description;
		this.body = null;
		this.routePath = null;
		this.security = spec.security instanceof Array ? spec.security : [];
		this.pathParams = [];
		this.queryParams = [];
		this.handler = spec.handler instanceof Array ? spec.handler : [spec.handler];
		this.tags = spec.tags || [];

		//Parse out responses
		for (let code in spec.responses)
		{
			const respSpec = spec.responses[code];

			//Accept either a schema object directly or an object with a description and content.
			if ('description' in respSpec || 'content' in respSpec)
			{
				this.responses[code] = new RouteResponse(code, respSpec.content, respSpec.description);
			}
			else
			{
				this.responses[code] = new RouteResponse(code, respSpec);
			}
		}

		if ("body" in spec)
		{
			if ('description' in spec.body || 'content' in spec.body)
			{
				this.body = new RouteBody(spec.body.description, spec.body.content)
			}
			else
			{
				this.body = new RouteBody(null, spec.body);
			}
		}

		if (typeof path == 'string' || path instanceof String)
		{
			this.routePath = path;
		}
		else
		{
			//It's a rp template string
			this.routePath = path.pathString;
			for (let param of path.params)
			{
				this.pathParams.push(new RouteParameter(param.name, param.schema, param.description, true));
			}
		}

		for (let paramId in spec.query)
		{
			const param = spec.query[paramId];

			if ("schema" in param || "description" in param)
			{
				this.queryParams.push(new RouteParameter(paramId, param.schema, param.description, param.required))
			}
			else
			{
				this.queryParams.push(new RouteParameter(paramId, param))
			}
		}
	}

	applyToDocument(doc)
	{
		const convertedRoutePath = this.routePath.replace(/:([a-zA-Z0-9_\-]*)/g, (match, paramName) =>
		{
			return `{${paramName}}`;
		})

		//Ensure the route exists in the doc.
		if (!(convertedRoutePath in doc.paths))
			doc.paths[convertedRoutePath] = {};

		const opdoc = {};

		opdoc.operationId = this.operationId;

		if (this.tags.length > 0)
			opdoc.tags = this.tags;

		if (this.description)
			opdoc.description = this.description;

		const parameters = [];

		for (let queryParam of this.queryParams)
		{
			const param = queryParam.toDocument(doc);
			param.in = 'query';
			parameters.push(param);
		}

		for (let pathParam of this.pathParams)
		{
			const param = pathParam.toDocument(doc);
			param.in = 'path';
			parameters.push(param);
		}

		if (parameters.length > 0)
		{
			opdoc.parameters = parameters;
		}

		if (this.body)
		{
			opdoc.requestBody = this.body.toDocument(doc);
		}

		for (let code in this.responses)
		{
			if (!opdoc.responses)
				opdoc.responses = {};

			opdoc.responses[code] = this.responses[code].toDocument(doc);
		}

		if (this.security.length > 0)
		{
			opdoc.security = this.security.map((handler) => handler.toDocument())
		}

		doc.paths[convertedRoutePath][this.operation] = opdoc;
	}

	applyRoute(router)
	{
		//TODO: Put security checkers here.
		let security = [];
		if (this.security.length > 0)
		{
			security = [async (req, res, next) =>
			{
				for (let handler of this.security)
				{
					if (await handler.expressValidator(req))
					{
						return next();
					}
				}

				const notAuthorized = new Error("Not authorized");
				notAuthorized.status = 401;
				return next(notAuthorized);
			}]
		}

		//TODO: Parse out the body here.


		//TODO: Put validators here.

		const chain = [...security, ...this.handler];

		router[this.operation](this.routePath, chain);
	}
}

module.exports = {
	rp,
	Route
}

/*
const id = {
	name: 'id',
	description: 'The id. Duh.',
	schema: <Schema Object>
}

module.exports = [
	new Route ('createWidget', `/widgets`, {
		operation: 'get',
		responses: {
			200: <Schema Object>
			201: {
				description:
				content: <Schema Object>
			}
		},
		body: <Schema Object>
	}),
	new Route ('getWidget', rp`/widgets/${id}`, {
		operation: 'get',
		responses: {
			200: <Schema Object>
			201: {
				description:
				content: <Schema Object>
			}
		},
		query: {
			'parameter_name': <Schema Object>
			'parameter_name': {
				description: 'It's a param!'
				schema: <Schema Object>
				required: true
			}
		}
		body: <Schema Object>
	})
]

*/