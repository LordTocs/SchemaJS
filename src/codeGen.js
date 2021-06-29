

function renderIndented(str)
{
	return str.replace('\n', '\n\t');
}

class CodeScope
{
	constructor(header)
	{
		this.body = "";
		this.header = header;
	}

	push(str)
	{
		this.body += str;
	}
}

class CodeGenerator
{
	constructor()
	{
		this.varCounter = 0;
		this.refs = {};
		this.flowStack = [new CodeScope(null)];
	}

	getVar()
	{
		const varName = `var${this.varCounter++}`;
		return varName;
	}

	addExternalRef(name, value)
	{
		this.refs[name] = value;
	}

	push(str)
	{
		const scope = this.flowStack[this.flowStack.length - 1];
		scope.push(str);
	}

	statement(str)
	{
		this.push(`${str}\n`);
	}

	forLoop(array)
	{
		const iterator = this.getVar();
		this.openScope(`for (let ${iterator} = 0; ${iterator} < ${array}.length; ++${iterator})`);
		return iterator;
	}

	openScope(header)
	{
		this.flowStack.push(
			new CodeScope(header)
		)
	}

	closeScope()
	{
		const scope = this.flowStack.pop();

		//trim it
		scope.body = scope.body.trim();
		if (scope.body.length == 0)
		{
			//There's nothing here don't add it.
			return;
		}

		const outerScope = this.flowStack[this.flowStack.length - 1];

		if (scope.header)
		{
			outerScope.push(scope.header);
			outerScope.push('\n');
		}
		outerScope.push('{\n');
		outerScope.push(renderIndented(scope.body));
		outerScope.push('}\n');
	}

	ifStatement(condition)
	{
		this.openScope(`if (${condition})`);
	}

	createFunction(args = [])
	{
		//TODO: Assert there's only one scope here meaning we've closed any open scopes.
		const lastScope = this.flowStack[0];
		lastScope.body = lastScope.body.trim();

		const func = new Function(...args, ...Object.keys(this.refs), lastScope.body);

		return (...argValues) => func(...argValues, ...Object.values(this.refs));
	}
}

module.exports = { CodeGenerator };