module.exports = function (plop) {
    plop.setGenerator('scaffold', {
      description: 'Scaffold strategist module',
      prompts: [
        {
          type: 'input',
          name: 'name',
          message: 'Module name (e.g. SignalFlow)'
        }
      ],
      actions: [
        {
          type: 'add',
          path: 'src/{{pascalCase name}}.tsx',
          templateFile: 'tools/templates/module.hbs'
        }
      ]
    });
  };
  