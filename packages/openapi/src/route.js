const { Schema } = require("schema");

function emitSchema(schema, doc)
{
	let schemaObj = null;

	if (schema.name)
	{
		//This is a reference
		schemaObj = { '$ref': `#/components/schemas/${schema.name}` };

		//Add the reference manually
		if (schema.name in doc.components.schemas)
			return; //It's already added.

		doc.components.schemas[schema.name] = schema.toJsonSchema(true, doc.components.schemas);
	}
	else
	{
		//This is an inline schema
		//TODO: Handle refs
		schemaObj = schema.toJsonSchema(true, doc.components.schemas);
	}

	return schemaObj;
}

class OpenAPIContent
{
	constructor(schema)
	{
		this.content = schema instanceof Schema ? schema : new Schema(null, schema)
	}

	toDoc(doc)
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
		this.content = new OpenAPIContent(content);
		this.description = description;
	}

	toDoc(doc)
	{
		const result = {
			content: this.content.toDoc(doc)
		};

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

	toDoc(doc)
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

function rp(strings, ...params)
{
	let pathString = "";

	for (let i = 0; i < strings.length; ++i)
	{
		pathString += strings[i];
		if (paramObjects[i])
		{
			pathString += `:${paramObjects[i].name}`
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
		this.pathParams = [];
		this.queryParams = [];
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
			this.body = new OpenAPIContent(spec.body);
		}

		if (typeof path == 'string' || path instanceof String)
		{
			this.routePath = path;
		}
		else
		{
			//It's a rp template string
			this.routePath = path.pathString;
			for (let param in path.params)
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
				this.queryParams.push(new RouteParameter(paramid, param))
			}
		}
	}

	applyToDocument(doc)
	{
		//Ensure the route exists in the doc.
		if (!(this.routePath in doc.paths))
			doc.paths[this.routePath] = {};

		const opdoc = {};

		opdoc.operationId = this.operationId;

		if (this.tags.length > 0)
			opdoc.tags = this.tags;

		if (this.description)
			opdoc.description = this.description;

		const parameters = [];

		for (let queryParam in this.queryParams)
		{
			const param = queryParam.toDoc(doc);
			param.in = 'query';
			parameters.push(param);
		}

		for (let pathParam in this.pathParams)
		{
			const param = pathParam.toDoc(doc);
			param.in = 'path';
			parameters.push(param);
		}

		if (parameters.length > 0)
		{
			opdoc.parameters = parameters;
		}

		if (this.body)
		{
			opdoc.requestBody = this.body.toDoc(doc);
		}

		for (let code in this.responses)
		{
			if (!opdoc.responses)
				opdoc.responses = {};

			opdoc.responses[code] = this.responses[code].toDoc(doc);
		}

		doc.paths[this.routePath][this.operation] = opdoc;
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