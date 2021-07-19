const { Schema } = require('schema');

const TestSchema = new Schema('TestSchema', {
	type: Object,
	properties: {
		hello: String,
		goodbye: Number,
	}
});


console.log(TestSchema.toJsonSchema());


