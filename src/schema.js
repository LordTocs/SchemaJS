const jsonSchema = require("./jsonSchema");
const { schemaTypes } = require('./schemaTypes');
const addFormats = require('ajv-formats');
const Ajv = require('ajv');
const { generateWalker } = require("./schemaDataWalker");

class Schema 
{
	static schemaTypes = [...schemaTypes];
	static ajv = new Ajv();

	static use(middleware)
	{
		middleware(Schema);
	}

	constructor(name, schemaObj)
	{
		this.name = name;
		this.schemaObj = schemaObj;

		this.validator = Schema.ajv.compile(this.toJsonSchema());
		this.postParser = generateWalker(this, (key, variable, type, code) => {
			if (type.postParse)
			{
				const typeName = type.constructor.name;
				code.addExternalRef(typeName, type);
				code.statement(`${variable} = ${typeName}.postParse(${variable});`);
			}
		})
	}

	validateJSON(data)
	{
		return this.validator(data);
	}

	postParse(data)
	{
		return this.postParser(data);
	}
}

addFormats(Schema.ajv);

Schema.use(jsonSchema);

module.exports = Schema;