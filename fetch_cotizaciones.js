const request = require('request')

module.exports = function(ctx, cb) {
    
    
request.post('https://api.ibcambio.com/api/gettoken/', {
  json: {
    usuario: ctx.secrets.usuario,
    contrasena: ctx.secrets.contrasena
  }
}, (error, res, body) => {
  if (error) {
    console.error(error)
    cb(error, null)
    return
  }
  var token = body
  
  request.get('https://api.ibcambio.com/api/cotizaciones/', {headers: token},
    (error, res, body) => {
        if (error) {
        console.error(error)
        return
        }
        console.log(`statusCode cotizaciones: ${res.statusCode}`)
        const json = JSON.parse(body)
        var cotizacion = json.Cotizaciones.find(function(element) {return element.plazo == '24hs.'})
        cb(null, cotizacion)
    })
})
    
}



