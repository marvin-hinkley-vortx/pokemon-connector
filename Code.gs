function getAuthType() {
  return { type: 'NONE' };
}

function getConfig(request) {
  var cc = DataStudioApp.createCommunityConnector();
  var config = cc.getConfig();
  
  config.newTextInput()
  .setId('species')
  .setName('Enter your desired pokemon species')
  .setHelpText('just alpha characters, please')
  .setPlaceholder('Pikachu')
  
  config.setDateRangeRequired(true);
  
  return config.build();
}

function getSchema(request) {
  var fields = getFields(request).build();
  return { schema: fields };
}

function getFields() {
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;
  
  fields.newDimension()
  .setId('name')
  .setType(types.TEXT);
  
  fields.newDimension()
  .setId('color')
  .setType(types.TEXT);
  
  fields.newMetric()
  .setId('captureRate')
  .setType(types.NUMBER);
  
  fields.newDimension()
  .setId('habitat')
  .setType(types.TEXT);
  
  fields.newMetric()
  .setId('baseHappiness')
  .setType(types.NUMBER);
  
  return fields;
}

function getData(request) {
  var requestedFieldIds = request.fields.map(function(field) {
    return field.name;
  });
  var requestedFields = getFields().forIds(requestedFieldIds);
  
  var url = [
    'https://pokeapi.co/api/v2/pokemon-species/',
    request.configParams.species
  ];
  var response = UrlFetchApp.fetch(url.join(''));
  var parsedResponse = JSON.parse(response);
  var rows = responseToRows(requestedFields, parsedResponse, request.configParams.species);
  
  return {
    schema: requestedFields.build(),
    rows: rows
  };  
}

function responseToRows(requestedFields, response, packageName) {
  return response.map(function(pokemon) {
    var row = [];
    requestedFields.asArray().forEach(function (field) {
      switch (field.getId()) {
        case 'name':
          return row.push(pokemon.name);
        case 'color':
          return row.push(pokemon.color.name);
        case 'habitat':
          return row.push(pokemon.habitat.name);
        case 'captureRate':
          return row.push(pokemon.capture_rate);
        case 'baseHappiness':
          return row.push(pokemon.base_happiness);
        default:
          return row.push('');
      }
    });
    return { values: row };
  });
}