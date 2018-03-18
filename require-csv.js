// const connection = require('./db-connection');
const server = require('./server/server');
const Emisiones = server.models.Emisiones;
// console.log(Emisiones);
const columns = [
  "FECHA","CLAVE_EST","PARAMETRO","HORA01","HORA02","HORA03","HORA04","HORA05",
  "HORA06","HORA07","HORA08","HORA09","HORA10","HORA11","HORA12","HORA13","HORA14",
  "HORA15","HORA16","HORA17","HORA18","HORA19","HORA20","HORA21","HORA22","HORA23","HORA24"
];

const files = [
  "1996", "1997", "1998", 
  "1999", "2000", "2001", 
  "2002", "2003", "2004", 
  "2005", "2006", "2007", 
  "2008", "2009", "2010", 
  "2011"
];


const { eachSeries, each, waterfall } = require('async');
const csvToArray = require("csv-to-array");
let data = [];

eachSeries(files, (file, cb) => {
  csvToArray({
    file: `./csv_outputs/${file}.csv`,
    columns: columns
  }, function (err, array) {
    if(err)
      return cb(err);

      
      data = [ ...data.concat(array) ];
      // console.log(data.length);
      return cb();
    // console.log('data: ', data.length);
  });
},

  err => {
    if(err)
      console.log("Errorsito", err);
      insertArray( data );
      //console.log("data", data);
});


function insertArray( data ) {
  console.log("AGUANTA VARA, MEN");
  let rowsToInsert = removeHeaderRows(data);
  console.log('rowsToInsert: ', rowsToInsert.length);
  // Emisiones.create( rowsToInsert, (err, createdRows) => {
  //         console.log("adentro");
  //   if ( err )
  //     console.log("HUBO UN ERRORSINI", err);
    
  //   console.log("TODO SE REGISTRÓ BIEN SUKISTRUKIS");
  //   process.exit(0);

  // });
  // console.log("OTS, MEN");
}


function removeHeaderRows(data) {
  return data.filter( element => element.FECHA != 'FECHA');
}


function convertToArrayFormat(rowsToInsert) {
  return rowsToInsert.map(row => Object.values(row));
}

