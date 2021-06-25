const { _ } = require('ajv');

class SchemaTransformer
{
	constructor(schema)
	{
		this.schema = schema;
		this.result = {};
	}

	transform()
	{
		Object.assign(this.result, this._transformValue(this.schema.schemaObj));
	}

	_transformValue(value)
	{
		let typeValue = value;

		if (value instanceof Array)
		{
			typeValue = Array;
		}
		else if (value instanceof Object)
		{
			if ("type" in value)
			{
				typeValue = value.type;
			}
			else
			{
				//Object but no type?
			}
		}

		if (typeValue === 'object' || typeValue === Object)
		{
			//This is a sub object.
			let subObj = this.createSubObject();
			for (let key in value.properties)
			{
				const propValue = value.properties[key];
				//Recursive Property Visit
				this.setProp(subObj, key, this._transformValue(propValue));
			}

			return subObj;
		}

		if (typeValue === 'array' || typeValue === Array)
		{
			//This is an array
			let subArray = this.createSubArray();
			let arrayItems = value.items;
			if (!arrayItems && value instanceof Array)
			{
				arrayItems = value;
			}

			for (let arrayValue of arrayItems)
			{
				//Recursive Array Visit
				this.pushArrayItem(subArray, this._transformValue(arrayValue));
			}

			return subArray;
		}

		if (typeValue.name === 'Schema')
		{
			//Visit Ref
			return this.createReference(typeValue);
		}

		const type = this.schema.constructor.schemaTypes.find((t) => t.isType(typeValue));

		if (!type)
		{
			console.error("Unknown!");
		}

		//Visit Property
		return this.createProperty(type, value);
	}
}

module.exports = {
	SchemaTransformer
}