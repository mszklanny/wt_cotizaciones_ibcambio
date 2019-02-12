const request = require('request');

module.exports = function(ctx, cb) {

  ctx.storage.get(function (error, thresholds) {
    if (error) {
      return cb(error);
    }
        
   request.post('https://api.ibcambio.com/api/gettoken/', {
      json: {
        usuario: ctx.secrets.usuario,
        contrasena: ctx.secrets.contrasena
      }
    }, (err, res, body) => {
    if (err) {
      return cb(err, null);
    }
    var token = body;
  
    request.get('https://api.ibcambio.com/api/cotizaciones/', {headers: token}, (error, res, body) => {
          if (error) {
            return cb(error, null);
          }
          console.log(`statusCode cotizaciones: ${res.statusCode}`);
          const json = JSON.parse(body);
          var cotizacion = json.Cotizaciones.find(function(element) {return element.plazo === '24hs.'});
          if (cotizacion.Compra >= thresholds.Compra) {
            return cb(null, "Vender dólares a " + cotizacion.Compra + ". Hábil? " + json.Habil);
          }
          if (cotizacion.Venta <= thresholds.Venta) {
            return cb(null, "Comprar dólares a " + cotizacion.Venta + ". Hábil? " + json.Habil);
          }
          return cb(null, cotizacion);
      });
    });
  });
}



