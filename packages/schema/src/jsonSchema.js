const { SchemaTransformer } = require('./schemaTransformer');
const { StringType, NumberType, DateType, BooleanType } = require('./schemaTypes');

class JsonSchemaTransformer extends SchemaTransformer
{
	constructor(schema, includeDefinitions = true, definitionsObj = null, definitionsRoot="#/definitions")
	{
		super(schema);
		this.includeDefinitions = includeDefinitions;
		this.definitionsObj = definitionsObj;
		this.definitionsRoot = definitionsRoot;
	}

	_markRequired(name)
	{
		if (!("required" in this.result))
			this.result.required = [];
		this.result.required.push(name);
	}

	_addReference(schema)
	{
		if (!this.includeDefinitions)
			return;
		
		if (!this.definitionsObj && !("definitions" in this.result))
			this.result.definitions = {};
		
		const defObj = this.definitionsObj || this.result.definitions;

		if (defObj[schema.name])
			return; //It's already added
		
		const subtf = new JsonSchemaTransformer(schema, true, defObj, this.definitionsRoot);

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
		this._addReference(schema);

		return {
			$ref: `${this.definitionsRoot}/${schema.name}`
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

	BooleanType.prototype.toJsonSchemaType = function()
	{
		return 'boolean';
	}

	BooleanType.prototype.toJsonSchemaProperties = function()
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

	schema.prototype.toJsonSchema = function(includeDefinitions = true, definitionsObj = null, definitionsRoot = "#/definitions")
	{
		const tf = new JsonSchemaTransformer(this, includeDefinitions, definitionsObj, definitionsRoot);

		tf.transform();

		return tf.result;
	}
}

module.exports = install;