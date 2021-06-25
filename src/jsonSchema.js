const { SchemaTransformer } = require('./schemaTransformer');


class JsonSchemaTransformer extends SchemaTransformer
{
	constructor(schema)
	{
		super(schema);
		this.jsonSchema = {};
	}

	createSubObject()
	{
		return {
			type: 'object',
			properties: {}
		}
	}

	createSubArray()
	{
		return {
			type: 'array',
		}
	}

	createReference(schema)
	{
		//Store the list of refs somewhere.

		return {
			$ref: `#/definitions/${schema.name}`
		}
	}

	createProperty(type, typeInfo)
	{
		const result = {};
		result.type = type.toJsonSchemaType();

		Object.assign(result, type.toJsonSchemaProperties(typeInfo))

		return result;
	}

	pushArrayItem(subArray, item)
	{
		if (!subArray.items)
		{
			subArray.items = item;
		}
	}

	setProp(obj, key, value)
	{
		obj.properties[key] = value;
	}
}

module.exports = {
	JsonSchemaTransformer
}