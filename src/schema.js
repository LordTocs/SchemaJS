const jsonSchema = require("./jsonSchema");
const { schemaTypes } = require('./schemaTypes');

class Schema 
{
	static schemaTypes = [...schemaTypes];

	static use(middleware) {
		middleware(Schema);
	}

	constructor(name, schemaObj)
	{
		this.name = name;
		this.schemaObj = schemaObj;
	}
}

Schema.use(jsonSchema);

module.exports = Schema;