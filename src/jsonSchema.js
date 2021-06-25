const { SchemaTransformer } = require('./schemaTransformer');
const { StringType, NumberType, DateType } = require('./schemaTypes');

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

function install (schema) {
	StringType.prototype.toJsonSchemaType = function()
	{
		return 'string';
	}

	StringType.prototype.toJsonSchemaProperties = function()
	{
		return {};
	}

	NumberType.prototype.toJsonSchemaType = function()
	{
		return 'number';
	}

	NumberType.prototype.toJsonSchemaProperties = function(propValue)
	{
		const result = {}
		if ("min" in propValue)
		{
			result.min = propValue.min;
		}
		if ("max" in propValue)
		{
			result.max = propValue.max;
		}
		return result;
	}

	DateType.prototype.toJsonSchemaType = function()
	{
		return 'string';
	}

	DateType.prototype.toJsonSchemaProperties = function()
	{
		return { format: 'date-time' };
	}

	schema.prototype.toJsonSchema = function()
	{
		const tf = new JsonSchemaTransformer(this);

		tf.transform();

		return tf.result;
	}
}

module.exports = install;