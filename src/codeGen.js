

class CodeGenerator
{
	constructor()
	{
		this.indent = 0;
		this.code = "";
		this.varCounter = 0;
		this.refs = {};
	}

	newLine()
	{
		this.code += '\n';
		for (let i = 0; i < this.indent; ++i)
		{
			this.code += '	';
		}
	}

	letVar()
	{
		const varName = `var${this.varCounter++}`;
		this.code += `let ${varName}`;
		return varName;
	}

	constVar()
	{
		const varName = `var${this.varCounter++}`;
		this.code += `const ${varName}`;
		return varName;
	}

	addExternalRef(name, value)
	{
		this.refs[name] = value;
	}

	push(str)
	{
		this.code += str;
	}

	forLoop(array)
	{
		this.push(`for (`);
		const iterator = this.letVar();
		this.push(` = 0; ${iterator} < ${array}.length; ++${iterator})`);
		this.openScope();
		return iterator;
	}

	openScope()
	{
		this.newLine();
		this.code += '{'
		this.indent++;
		this.newLine();
	}

	closeScope()
	{
		this.indent--;
		this.newLine();
		this.code += '}'
		this.newLine();
	}

	ifStatement(condition)
	{
		this.code += `if (${condition})`;
		this.openScope();
	}

	createFunction(args = [])
	{
		const func =  new Function(...args, ...Object.keys(this.refs), this.code);

		return (...argValues) => func(...argValues, ...Object.values(this.refs));
	}
}

module.exports = { CodeGenerator };