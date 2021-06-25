

class SchemaType
{
	isType(typeValue)
	{
		return false;
	}
}

class StringType extends SchemaType
{
	isType(typeValue)
	{
		return (typeValue === 'string' || typeValue === String);
	}

	toJsonSchemaType()
	{
		return 'string';
	}

	toJsonSchemaProperties()
	{
		return {};
	}
}

class NumberType
{
	isType(typeValue)
	{
		return (typeValue === 'number' || typeValue === Number);
	}

	toJsonSchemaType()
	{
		return 'number';
	}

	toJsonSchemaProperties(propValue)
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
}

class DateType
{
	isType(typeValue)
	{
		return (typeValue === Date);
	}

	toJsonSchemaType()
	{
		return 'string';
	}

	toJsonSchemaProperties()
	{
		return { format: 'date-time' };
	}
}

module.exports = {
	schemaTypes: [new StringType, new NumberType, new DateType],
	SchemaType,
}