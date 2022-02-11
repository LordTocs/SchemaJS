
const { SchemaTransformer } = require('schema');

class MongooseSchemaTransformer extends SchemaTransformer
{
	constructor(schema)
	{
		super(schema);
	}

	createSubObject()
	{
		return {};
	}

	createSubArray()
	{
		return [];
	}

	createReference(schema)
	{
		if (schema.schemaObj.type == Object || schema.schemaObj.type == 'object')
		{
			return schema.getMongooseSchema();
		}
		else
		{
			const subTransformer = new MongooseSchemaTransformer(schema);
			subTransformer.transform();
			return subTransformer.result;
		}
	}

	createProperty(key, schemaObj, schemaType)
	{
		const result = {};

		result.type = schemaType.toMongooseSchemaType();

		Object.assign(result, schemaType.toMongooseSchemaProperties(schemaObj))

		if (schemaObj.required)
		{
			result.required = true;
		}

		return result;
	}

	pushArrayItem(subArray, item)
	{
		subArray.push(item)
	}

	setProp(obj, key, value)
	{
		obj[key] = value;
	}
}


module.exports = {
	MongooseSchemaTransformer
}