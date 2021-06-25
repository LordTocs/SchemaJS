const { JsonSchemaTransformer } = require("./jsonSchema");

class Schema 
{
	constructor(name, schemaObj)
	{
		this.name = name;
		this.schemaObj = schemaObj;
	}

	toJsonSchema()
	{
		const tf = new JsonSchemaTransformer(this.schemaObj);

		tf.transform();

		return tf.result;
	}
}

module.exports = Schema;