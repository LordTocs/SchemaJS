const { CodeGenerator } = require('./codeGen.js');


function walkDataInternal(key, value, schemaObj, schema, func)
{
	let typeValue = schemaObj;

	if (schemaObj instanceof Array)
	{
		typeValue = Array;
	}
	else if (schemaObj instanceof Object)
	{
		if ("type" in schemaObj)
		{
			typeValue = schemaObj.type;
		}
		else
		{
			//Object but no type?
		}
	}

	if (typeValue === 'object' || typeValue === Object)
	{
		//This is a sub object.
		for (let subkey in schemaObj.properties)
		{
			const propValue = schemaObj.properties[subkey];
			//Recursive Property Visit
			value[subkey] = walkDataInternal(subkey, value[subkey], propValue, schema, func);
		}
		return value;
	}

	if (typeValue === 'array' || typeValue === Array)
	{
		//This is an array
		let schemaArray = schemaObj.items;
		if (!schemaArray && schemaObj instanceof Array)
		{
			schemaArray = schemaObj;
		}

		let i = 0;
		for (let arrayItem of value)
		{
			value[i] = walkDataInternal(i, arrayItem, schemaArray[0], schema, func) //How to resolve this
			++i;
		}

		return value;
	}

	if (typeValue.name === 'Schema')
	{
		//Visit Ref
		return walkDataInternal(key, value, typeValue.schemaObj, typeValue, func);
	}

	const type = schema.constructor.schemaTypes.find((t) => t.isType(typeValue));

	if (!type)
	{
		return value;
	}

	//Visit Property
	const result = func(key, value, type);
	return result == undefined ? value : result;
}

function generateWalkerInternal(key, variable, schemaObj, schema, code, func)
{
	let typeValue = schemaObj;

	if (schemaObj instanceof Array)
	{
		typeValue = Array;
	}
	else if (schemaObj instanceof Object)
	{
		if ("type" in schemaObj)
		{
			typeValue = schemaObj.type;
		}
		else
		{
			//Object but no type?
		}
	}

	if (typeValue === 'object' || typeValue === Object)
	{

		//This is a sub object.
		for (let subkey in schemaObj.properties)
		{
			const subSchemaObj = schemaObj.properties[subkey];
			//Recursive Property Visit
			generateWalkerInternal(subkey, `${variable}.${subkey}`, subSchemaObj, schema, code, func);
		}
		return;
	}

	if (typeValue === 'array' || typeValue === Array)
	{
		//This is an array
		let schemaArray = schemaObj.items;
		if (!schemaArray && schemaObj instanceof Array)
		{
			schemaArray = schemaObj;
		}

		const iterator = code.forLoop(variable);

		generateWalkerInternal(iterator, `${variable}[${iterator}]`, schemaArray[0], schema, code, func);

		code.closeScope();

		return;
	}

	if (typeValue.name === 'Schema')
	{
		//Visit Ref
		generateWalkerInternal(key, variable, typeValue.schemaObj, typeValue, code, func);
		return;
	}

	const type = schema.constructor.schemaTypes.find((t) => t.isType(typeValue));

	if (!type)
	{
		return;
	}

	//Visit Property
	func(key, variable, type, code);
}


function generateWalker(schema, func)
{
	const code = new CodeGenerator();

	generateWalkerInternal(null, 'input', schema.schemaObj, schema, code, func);

	return code.createFunction(['input']);
}


function walkData(data, schema, func)
{
	return walkDataInternal(null, data, schema.schemaObj, schema, func);
}

module.exports = {
	walkData,
	generateWalker
};