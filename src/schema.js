const jsonSchema = require("./jsonSchema");
const { schemaTypes } = require('./schemaTypes');
const Ajv = require('ajv');

class Schema 
{
	static schemaTypes = [...schemaTypes];
	static ajv = new Ajv();

	static use(middleware) {
		middleware(Schema);
	}

	constructor(name, schemaObj)
	{
		this.name = name;
		this.schemaObj = schemaObj;

		ajv.addSchema(this.toJsonSchema(), name);
	}
}

Schema.use(jsonSchema);

module.exports = Schema;