
const { StringType, NumberType, DateType, SchemaType, BooleanType } = require('schema/src/schemaTypes');
const { MongooseSchemaTransformer } = require('./mongooseTransformer');


module.exports = function (mongoose)
{
	const ObjectId = mongoose.Types.ObjectId;

	class MongoIdType extends SchemaType
	{
		isType(typeValue)
		{
			return typeValue == ObjectId;//typeValue instanceof Function && typeValue.name == "ObjectId";
		}
		//Also include JSON Schema helpers
		toJsonSchemaType()
		{
			return 'string';
		}

		toJsonSchemaProperties()
		{
			return { pattern: "^[a-fA-F\d]{24}$/" }
		}

		toMongooseSchemaType()
		{
			return ObjectId;
		}

		toMongooseSchemaProperties()
		{
			return {};
		}
	}


	return function (schema)
	{
		StringType.prototype.toMongooseSchemaType = function ()
		{
			return String;
		}

		StringType.prototype.toMongooseSchemaProperties = function ()
		{
			return {};
		}

		BooleanType.prototype.toMongooseSchemaType = function ()
		{
			return Boolean;
		}

		BooleanType.prototype.toMongooseSchemaProperties = function ()
		{
			return {};
		}

		NumberType.prototype.toMongooseSchemaType = function ()
		{
			return Number;
		}

		NumberType.prototype.toMongooseSchemaProperties = function (propValue)
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

		DateType.prototype.toMongooseSchemaType = function ()
		{
			return Date;
		}

		DateType.prototype.toMongooseSchemaProperties = function ()
		{
			return {};
		}

		//Add support for ObjectID
		schema.schemaTypes.push(new MongoIdType());

		schema.prototype.getMongooseSchema = function ()
		{
			//Lazily create mongoose schema
			if (this.mongooseSchema)
				return this.mongooseSchema;

			const tf = new MongooseSchemaTransformer(this);
			tf.transform();

			const mongooseSchemaObj = tf.result;
			
			const hasAnyId = !!mongooseSchemaObj['_id'];
			const hasObjectId = mongooseSchemaObj['_id'] == ObjectId || mongooseSchemaObj['_id']?.type == ObjectId;

			if (hasObjectId)
			{
				delete mongooseSchemaObj._id;
			}

			// SchemaA has _id: Number -> hasAnyId=true | hasObjectId=false
			// SchemaB has _id: ObjectID -> hasAnyId=true | hasObjectId=true
			// SchemaC has no _id -> hasAnyId=false

			this.mongooseSchema = new mongoose.Schema(tf.result, { _id: hasAnyId });

			//if (tf.result['_id'] == ObjectId || tf.result['_id']?.type == ObjectId)
			//{
			//	this.mongooseSchema.index({_id: 1});
			//}

			return this.mongooseSchema;
		}

		schema.prototype.getMongooseModel = function ()
		{
			if (this.mongooseModel)
				return this.mongooseModel;

			const schema = this.getMongooseSchema();

			this.mongooseModel = mongoose.model(this.name, schema);

			return this.mongooseModel;
		}
	}
}