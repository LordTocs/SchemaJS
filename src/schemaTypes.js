

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
}

class NumberType
{
	isType(typeValue)
	{
		return (typeValue === 'number' || typeValue === Number);
	}
}

class DateType
{
	isType(typeValue)
	{
		return (typeValue === Date);
	}

	postParse(value)
	{
		return new Date(value);
	}
}

module.exports = {
	StringType,
	NumberType,
	DateType,
	schemaTypes: [new StringType, new NumberType, new DateType],
	SchemaType,
}