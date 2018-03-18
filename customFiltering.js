const server = require('./server/server');
const Emisiones = server.models.Emisiones;
const Json2csvParser = require('json2csv').Parser;
const fs = require('fs');

const property = 'HORA08'
const CLAVE_EST = 'AGU';
const PARAMETRO = 'CO';
const INITIAL_DATE = '1998-01-01';
const FINAL_DATE = '1998-12-31';

const filter = {
  where: {
    CLAVE_EST,
    PARAMETRO,
    FECHA: {between: ['1996-01-01', '1996-12-31']}
  },
  order: 'FECHA ASC',
  fields: { [property]: true, FECHA: true },
}

Emisiones.find(filter)
  //Se obtienen el registro filtrados.
  .then( elements => {
    
    const length = elements.length;

    //Agregar llave única ordenada para identificar un orden ascendente en la fecha
    elements.forEach( (element, index) => {
      element.UNIQUE = index + 1;
    });

    //Se eliminan posibles ceros y negativos en las primeras dos posiciones para normalizar
    //los datos.
    for (let i = 0; i < 2; i++)
      if(elements[i][property] <= 0) 
        for (let x = i; x < length; x++) 
          if(elements[x][property] > 0) {
            elements[i][property] = elements[x][property];
            break;
          }



    //Se normalizan las posiciones con cero y negativos con el promedio de las dos anteriores.
    for (let i = 2; i < length; i++)
      if(elements[i][property] <= 0) {
        let mean = (elements[i-1][property] + elements[i-2][property])/2;
        elements[i][property] = mean;
      }

    return elements;

  })

  //Ordenar elementos por propiedad.
  .then( filteredArray => {
    
    return filteredArray.sort((obj1, obj2) => 
      obj1[property] - obj2[property]
    );
  })
  
  //Filtrar el ruido de los datos.
  .then( sortedElements => {
    console.log('sortedElements: ', sortedElements[0]);

    const length = sortedElements.length;
    console.log('initial length: ', length);
    const tenth = parseInt(length * .04);
    const nineteenth = parseInt(length * .96);
    
    
    const normalizedArray = sortedElements.slice( tenth, nineteenth );
    console.log(normalizedArray[normalizedArray.length-1]);
    return normalizedArray;

  })

  .then( removeNoiseElements => {
    return removeNoiseElements.sort((obj1, obj2) => 
      obj1['UNIQUE'] - obj2['UNIQUE']
    );
  })

  //Crea objeto CSV
  .then( normalizedArray => {
    console.log('normalizedArray gg: ', normalizedArray[0]);
    // const fields = Object.keys(normalizedArray[10]);
    const headerFields = [ 'UNIQUE', property ];

    console.log('headerFields: ', headerFields);
    const rows = normalizedArray.map( el => {
      return { 'UNIQUE': el.UNIQUE, [property]: el[property], }
    });
    
    const json2csvParser = new Json2csvParser({ fields: headerFields });
    const csv = json2csvParser.parse(rows);
  
    return csv;

    // console.log('fields: ', fields);
  })
  //Escribe objeto CSV en archivo.
  .then( csv => {
    // write to a CSV new file.
  fs.writeFile(`./csv_results/${property}_${CLAVE_EST}_${PARAMETRO}_${INITIAL_DATE}_${FINAL_DATE}_${new Date().getTime().toString()}.csv`, csv, (err) => {  
    // throws an error, you could also catch it here
    if (err) throw err;

    // success case, the file was saved
    console.log('¡CSV guardado!');
    process.exit(0);
  });
  })
  .catch( err => console.log("err", err));



