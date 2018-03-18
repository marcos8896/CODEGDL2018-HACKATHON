'use strict';

const server = require('../../server/server');
const Json2csvParser = require('json2csv').Parser;
const fs = require('fs');

module.exports = function(Emisiones) {

    Emisiones.getCSV = function addBoss(
    propertyHour, CLAVE_EST, 
    PARAMETRO, INITIAL_DATE,
    FINAL_DATE, cb
  ) {
    console.log('propertyHour: ', propertyHour);
    console.log('CLAVE_EST: ', CLAVE_EST);
    console.log('PARAMETRO: ', PARAMETRO);
    console.log('INITIAL_DATE: ', INITIAL_DATE);
    console.log('FINAL_DATE: ', FINAL_DATE);


    // const propertyHour = 'HORA08'
    // const CLAVE_EST = 'AGU';
    // const PARAMETRO = 'CO';
    // const INITIAL_DATE = '1998-01-01';
    // const FINAL_DATE = '1998-12-31';

    const filter = {
      where: {
        CLAVE_EST,
        PARAMETRO,
        FECHA: {between: [INITIAL_DATE, FINAL_DATE]}
      },
      order: 'FECHA ASC',
      fields: { [propertyHour]: true, FECHA: true },
    }
    
    // console.log('filter: ', JSON.stringify(filter, null, ' '));
    Emisiones.find(filter)
      //Se obtienen el registro filtrados.
      .then( elements => {
        console.log('elements: ', elements);
        
        const length = elements.length;

        //Agregar llave única ordenada para identificar un orden ascendente en la fecha
        elements.forEach( (element, index) => {
          element.UNIQUE = index + 1;
        });

        //Se eliminan posibles ceros y negativos en las primeras dos posiciones para normalizar
        //los datos.
        for (let i = 0; i < 2; i++)
          if(elements[i][propertyHour] <= 0) 
            for (let x = i; x < length; x++) 
              if(elements[x][propertyHour] > 0) {
                elements[i][propertyHour] = elements[x][propertyHour];
                break;
              }



        //Se normalizan las posiciones con cero y negativos con el promedio de las dos anteriores.
        for (let i = 2; i < length; i++)
          if(elements[i][propertyHour] <= 0) {
            let mean = (elements[i-1][propertyHour] + elements[i-2][propertyHour])/2;
            elements[i][propertyHour] = mean;
          }

        return elements;

      })

      //Ordenar elementos por propiedad.
      .then( filteredArray => {
        
        return filteredArray.sort((obj1, obj2) => 
          obj1[propertyHour] - obj2[propertyHour]
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
        const headerFields = [ 'UNIQUE', propertyHour ];

        console.log('headerFields: ', headerFields);
        const rows = normalizedArray.map( el => {
          return { 'UNIQUE': el.UNIQUE, [propertyHour]: el[propertyHour], }
        });
        
        const json2csvParser = new Json2csvParser({ fields: headerFields });
        const csv = json2csvParser.parse(rows);
      
        return csv;

        // console.log('fields: ', fields);
      })
      //Escribe objeto CSV en archivo.
      .then( csv => {
        // write to a CSV new file.
      fs.writeFile(`./csv_results/${propertyHour}_${CLAVE_EST}_${PARAMETRO}_${INITIAL_DATE}_${FINAL_DATE}_${new Date().getTime().toString()}.csv`, csv, (err) => {  
        // throws an error, you could also catch it here
        console.log('¡CSV guardado!');
        if (err) return cb(err);
        
        return cb(null, csv);

        // success case, the file was saved
      });
      })
      .catch( err => console.log("err", err));




    // return res.status(200).json({
    //   msg: "Apoko karnal"
    // });
    // cb(null, "gg");
    
  }

  Emisiones.remoteMethod('getCSV', {
    http: { path: '/getCSV/:propertyHour/:CLAVE_EST/:PARAMETRO/:INITIAL_DATE/:FINAL_DATE', verb: 'get'},
    accepts: [
      { arg: 'propertyHour', type: 'string' },
      { arg: 'CLAVE_EST', type: 'string' },
      { arg: 'PARAMETRO', type: 'string' },
      { arg: 'INITIAL_DATE', type: 'string' },
      { arg: 'FINAL_DATE', type: 'string' },
    ],
    returns:[
        { arg: 'result', type: 'object' },
        // { type: 'file', root: true }
    ]
  })


};
