const { Issuer } = require('openid-client');

function getBearerToken(authorization, tokenSchema)
{
	if (!authorization)
		return null;

	if (!authorization.startsWith('Bearer'))
		return null;

	const bearer = authorization.substring(7);

	if (tokenSchema && !tokenSchema.validateJSON(bearer))
		return null;

	return bearer;
}

/**
 * urls = {
 *   authorizationUrl: '',
 *   tokenUrl: '',
 *   refreshUrl: '',
 *   validationUrl:
 * }
 * 
 * flows=
 */
async function openIdConnect(name, oidcUrl, clientInfo, tokenSchema)
{
	const oidcIssuer = await Issuer.discover(oidcUrl);
	const oidcClient = new oidcIssuer.Client(clientInfo);

	const result = (scopes = []) =>
	{
		const validateHeader = async (authorization) =>
		{
			const token = getBearerToken(authorization, tokenSchema);

			if (!token)
			{
				return false;
			}

			//Should introspection be cached?
			const introspect = await oidcClient.introspect(token);

			//If the token isn't active, return false.
			if (!introspect.active)
			{
				return false;
			}

			//Check the scopes
			const tokenScopes = introspect.scope.split(' ');

			if (!scopes.every(s => tokenScopes.includes(s)))
				return false;

			return true;
		};

		return {
			toDocument: () =>
			{
				return {
					[name]: scopes
				}
			},
			expressValidator: async (req) =>
			{
				if (!await validateHeader(req.headers["authorization"]))
				{
					return false;
				}

				return true;
			},
		}
	};

	result.toDocument = () =>
	{
		return {
			type: 'openIdConnect',
			openIdConnectUrl: oidcUrl
		}
	}

	return result;
}

module.exports = {
	openIdConnect
}

