

module.exports = {
	catchErrors(routeFunc)
	{
		return async (req, res, next) =>
		{
			try
			{
				return await routeFunc(req, res, next);
			}
			catch (err)
			{
				console.error(err);
				if (!err.status)
				{
					err.status = 500;
				}
				return next(err);
			}
		}
	}

}