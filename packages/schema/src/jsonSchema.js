const { SchemaTransformer } = require('./schemaTransformer');
const { StringType, NumberType, DateType } = require('./schemaTypes');

class JsonSchemaTransformer extends SchemaTransformer
{
	constructor(schema, includeDefinitions = true, definitionsObj = null)
	{
		super(schema);
		this.jsonSchema = {};
		this.includeDefinitions = includeDefinitions;
		this.definitionsObj = definitionsObj;
	}

	_markRequired(name)
	{
		if (!("required" in this.jsonSchema))
			this.jsonSchema.required = [];
		this.jsonSchema.required.push(name);
	}

	_addReference(schema)
	{
		if (!this.includeDefinitions)
			return;
		
		if (!this.definitionsObj && !("definitions" in this.jsonSchema))
			this.jsonSchema.definitions = {};
		
		const defObj = this.definitionsObj || this.jsonSchema.definitions;
		
		const subtf = new JsonSchemaTransformer(this, true, defObj);

		subtf.transform();

		defObj[schema.name] = subtf.result;

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

	createProperty(key, schemaObj, schemaType)
	{
		const result = {};
		result.type = schemaType.toJsonSchemaType();

		Object.assign(result, schemaType.toJsonSchemaProperties(schemaObj))

		if (schemaObj.required && typeof key == 'string')
		{
			this._markRequired(key);
		}

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