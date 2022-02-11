

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

class BooleanType extends SchemaType
{
	isType(typeValue)
	{
		return (typeValue === 'boolean' || typeValue === Boolean);
	}
}


class NumberType extends SchemaType
{
	isType(typeValue)
	{
		return (typeValue === 'number' || typeValue === Number);
	}
}

class DateType extends SchemaType
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
	BooleanType,
	schemaTypes: [new StringType, new NumberType, new DateType, new BooleanType],
	SchemaType,
}