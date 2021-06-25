const jsonSchema = require("./jsonSchema");
const { schemaTypes } = require('./schemaTypes');
const addFormats = require('ajv-formats');
const Ajv = require('ajv');
const { walkData } = require("./schemaDataWalker");

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
	}

	validate(data)
	{
		return this.validator(data);
	}

	postParse(data)
	{
		//TODO: Use code gen to build faster post parse functions... for now just iterate.
		walkData(data, this, (key, value, type) => {
			if (type.postParse)
			{
				return type.postParse(value);
			}
		})
	}
}

addFormats(Schema.ajv);

Schema.use(jsonSchema);

module.exports = Schema;